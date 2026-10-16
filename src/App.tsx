import { useState, useEffect } from 'react';

type Todo = {
  id: number;
  text: string;
  done: boolean;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
};

function App() {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const addTodo = () => {
    if (text.trim() === '') return;
    setTodos([
      ...todos,
      { id: Date.now(), text, done: false, deadline, priority },
    ]);
    setText('');
    setDeadline('');
    setPriority('medium');
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearDone = () => {
    setTodos(todos.filter((todo) => !todo.done));
  };

  const startEdit = (id: number, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const saveEdit = () => {
    if (editText.trim() === '') return;
    setTodos(
      todos.map((todo) =>
        todo.id === editingId ? { ...todo, text: editText } : todo
      )
    );
    setEditingId(null);
    setEditText('');
  };

  const handleDrop = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;
    const fromIndex = todos.findIndex((t) => t.id === draggedId);
    const toIndex = todos.findIndex((t) => t.id === targetId);
    const updated = [...todos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setTodos(updated);
    setDraggedId(null);
  };

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.done;
    if (filter === 'done') return todo.done;
    return true;
  });

  return (
    <>
      <div className={darkMode ? 'app dark' : 'app'}>
        <h1>Min Todo App</h1>
        <div className="input-row">
          <input
            type="text"
            placeholder="Vad ska göras?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          />
          <input
            type="date"
            className="deadline-input"
            value={deadline}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <select
            className="priority-select"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as 'low' | 'medium' | 'high')
            }
          >
            <option value="low">🟢 Låg</option>
            <option value="medium">🟡 Mellan</option>
            <option value="high">🔴 Hög</option>
          </select>
          <button onClick={addTodo}>Lägg till</button>
        </div>

        <div className="filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Alla</button>
          <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Aktiva</button>
          <button className={filter === 'done' ? 'active' : ''} onClick={() => setFilter('done')}>Klara</button>
        </div>

        <p className="counter">
          {todos.filter((t) => !t.done).length} kvar att göra
        </p>

        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <li
              key={todo.id}
              draggable
              onDragStart={() => setDraggedId(todo.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(todo.id)}
              className={`${todo.done ? 'done' : ''} priority-${todo.priority} ${draggedId === todo.id ? 'dragging' : ''}`}
              onClick={() => toggleTodo(todo.id)}
              onDoubleClick={() => startEdit(todo.id, todo.text)}
            >
              {editingId === todo.id ? (
                <input
                  type="text"
                  className="edit-input"
                  value={editText}
                  autoFocus
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onBlur={saveEdit}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="todo-content">
                  <span>{todo.text}</span>
                  {todo.deadline && (
                    <small className="deadline">
                      📅 {todo.deadline}
                    </small>
                  )}
                </div>
              )}
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTodo(todo.id);
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {todos.some((t) => t.done) && (
          <button className="clear-btn" onClick={clearDone}>
            Rensa klara
          </button>
        )}
      </div>

      <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️' : '🌙'}
      </button>
    </>
  );
}

export default App;