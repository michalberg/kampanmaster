import { useState, useEffect, useRef } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Task } from './Task';
import { TaskForm } from './TaskForm';

export function TaskList({ projectId, members, filterPerson, showDone, user }) {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const editingRef = useRef(null);

  useEffect(() => {
    if (!editingTask) return;
    const handler = (e) => {
      if (editingRef.current && !editingRef.current.contains(e.target)) {
        setEditingTask(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editingTask]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const q = query(collection(db, 'projects', projectId, 'tasks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setTasks(data);
    });
    return unsubscribe;
  }, [projectId]);

  const filteredTasks = tasks.filter(t => {
    if (!showDone && t.done) return false;
    if (filterPerson && !t.people?.includes(filterPerson)) return false;
    return true;
  });

  const addTask = async (taskData) => {
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) : 0;
    await addDoc(collection(db, 'projects', projectId, 'tasks'), {
      ...taskData,
      done: false,
      order: maxOrder + 1,
      createdAt: serverTimestamp(),
      createdBy: user.email,
      createdByName: user.displayName,
      updatedAt: serverTimestamp(),
      updatedBy: user.email,
      updatedByName: user.displayName,
    });
    setShowForm(false);
  };

  const updateTask = async (taskId, updates) => {
    await updateDoc(doc(db, 'projects', projectId, 'tasks', taskId), {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: user.email,
      updatedByName: user.displayName,
    });
    setEditingTask(null);
  };

  const toggleTask = async (task) => {
    await updateTask(task.id, { done: !task.done });
  };

  const deleteTask = async (taskId) => {
    if (confirm('Smazat úkol?')) {
      await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId));
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    setTasks(reordered);

    await Promise.all(
      reordered.map((task, index) =>
        updateDoc(doc(db, 'projects', projectId, 'tasks', task.id), { order: index + 1 })
      )
    );
  };

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {filteredTasks.map(task => (
            editingTask?.id === task.id ? (
              <div key={task.id} className="py-2" ref={editingRef}>
                <TaskForm
                  members={members}
                  initialData={task}
                  onSave={(data) => updateTask(task.id, data)}
                  onCancel={() => setEditingTask(null)}
                />
              </div>
            ) : (
              <Task
                key={task.id}
                task={task}
                projectId={projectId}
                onToggle={() => toggleTask(task)}
                onEdit={() => setEditingTask(task)}
                onDelete={() => deleteTask(task.id)}
              />
            )
          ))}
        </SortableContext>
      </DndContext>

      {filteredTasks.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 py-3 italic">Žádné úkoly</p>
      )}

      {showForm ? (
        <div className="mt-2">
          <TaskForm
            members={members}
            onSave={addTask}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          + Přidat úkol
        </button>
      )}
    </div>
  );
}
