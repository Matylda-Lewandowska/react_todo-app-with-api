/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { Filter, Todo, ErrorMessageEnum } from './types/Todo';
import { Header } from './components/Header/Header';
import { TodoList } from './components/TodoList/TodoList';
import { Footer } from './components/Footer/Footer';
import { ErrorBin } from './components/ErrorBin/ErrorBin';
import {
  addTodo, deleteTodo, getTodos, patchTodo,
} from './api/todos';
import { handleError } from './components/ErrorBin/handleError';

const USER_ID = 11572;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [refreshTodos, setRefreshTodos] = useState<boolean>(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState<string>('');
  const [filter, setFilter] = useState<Filter>('All');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [idCompleatedArr, setIdCompleatedArr] = useState<number[]>([0]);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);

  useEffect(() => {
    getTodos(USER_ID)
      .then((data) => {
        setTodos(data);
      })
      .catch(() => {
        handleError(setErrorMessage, ErrorMessageEnum.noTodos);
      })
      .finally(() => {
        setTempTodo(null);
        setEditTodo(null);
      });
  }, [USER_ID, refreshTodos]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const displayedTodos = () => {
    let filteredTodos = [...todos];

    filteredTodos = filteredTodos.filter(todo => {
      if (filter === 'Active' && todo.completed) {
        return false;
      }

      if (filter === 'Completed' && !todo.completed) {
        return false;
      }

      return true;
    });

    return filteredTodos;
  };

  const handleCompletedStatus = (chosenTodo: Todo) => {
    const updatedData = { ...chosenTodo, completed: !chosenTodo.completed };

    // setEditIsLoading(true);
    setIdCompleatedArr((prev) => [...prev, chosenTodo.id]);
    patchTodo(chosenTodo.id, updatedData)
      .then(() => {
        // setTodos((current) => current.map((todo) => (todo.id === chosenTodo.id ? chosenTodo : todo)));
        setRefreshTodos(prev => !prev);
      })
      .catch(() => {
        handleError(setErrorMessage, ErrorMessageEnum.noUpdateTodo);
      })
      .finally(() => {
        setIdCompleatedArr(idCompleatedArr.filter((todoId) => todoId !== chosenTodo.id));
        // setEditIsLoading(false);
      });
  };

  const handleToggleAll = () => {
    if (todos.some(todo => !todo.completed)) {
      todos.forEach(
        (todo) => {
          patchTodo(todo.id, { completed: true })
            .then(() => {
              // setTodos((current) => current.map((ctodo) => ({ ...ctodo, completed: true })));
              // setEditIsLoading(true);
              setRefreshTodos(prev => !prev);
            })
            .catch(() => {
              handleError(setErrorMessage, ErrorMessageEnum.noUpdateTodo);
            })
            .finally(() => {
              // setEditIsLoading(false);
            });
        },
      );
    } else {
      todos.forEach(handleCompletedStatus);
    }
  };

  const handleDelete = (chosenTodo: Todo) => {
    setIdCompleatedArr((prev) => [...prev, chosenTodo.id]);

    deleteTodo(chosenTodo.id).then(() => {
      // setTodos((current) => current.map((ctodo) => (ctodo.id === chosenTodo.id ? chosenTodo : ctodo)));
      setRefreshTodos(prev => !prev);
    })
      .catch(() => {
        handleError(setErrorMessage, ErrorMessageEnum.noDeleteTodo);
      })
      .finally(() => {
        setIdCompleatedArr(idCompleatedArr.filter((todoId) => todoId !== chosenTodo.id));
      });
  };

  const handleNewTodoSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newTodoTitle.trim()) {
      handleError(setErrorMessage, ErrorMessageEnum.emptyTitle);

      return;
    }

    const trimmedTitle = newTodoTitle.trim();

    const newTodo = {
      userId: USER_ID,
      title: trimmedTitle,
      completed: false,
    };

    const tTodo = {
      id: 0,
      userId: USER_ID,
      title: trimmedTitle,
      completed: false,

    };

    setTempTodo(tTodo);

    addTodo(newTodo)
      .then(() => {
        setNewTodoTitle('');
        // setTodos((current) => [...current, tTodo]);
        setRefreshTodos(prev => !prev);
      })
      .catch(() => {
        handleError(setErrorMessage, ErrorMessageEnum.noPostTodo);
      })
      .finally(() => {
        // setTempTodo(null);
      });
  };

  const handleFormSubmitEdited
  = (event: React.FormEvent<HTMLFormElement>, chosenTodo: Todo) => {
    event.preventDefault();
    const trimmedTitle = chosenTodo.title.trim();
    const updatedData = { title: trimmedTitle };

    // setEditIsLoading(true);
    setIdCompleatedArr((prev) => [...prev, chosenTodo.id]);

    if (!trimmedTitle) {
      handleDelete(chosenTodo);
    } else if (trimmedTitle !== chosenTodo.title) {
      patchTodo(chosenTodo.id, updatedData)
        .then(() => {
          setRefreshTodos(prev => !prev);
        })
        .catch(() => {
          handleError(setErrorMessage, ErrorMessageEnum.noUpdateTodo);
        })
        .finally(() => {
          setIdCompleatedArr(idCompleatedArr.filter((todoId) => todoId !== chosenTodo.id));
          // setEditIsLoading(false);
        });
    }
  };

  const handleClearCompleted = () => {
    todos.filter(todo => todo.completed === true).forEach(todo => handleDelete(todo));
    setRefreshTodos(prev => !prev);
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          handleToggleAll={handleToggleAll}
          handleNewTodoSubmit={handleNewTodoSubmit}
          newTodoTitle={newTodoTitle}
          setNewTodoTitle={setNewTodoTitle}
          tempTodo={tempTodo}
        />

        {todos.length > 0 && (
          <TodoList
            displayedTodos={displayedTodos}
            tempTodo={tempTodo}
            handleCompletedStatus={handleCompletedStatus}
            handleFormSubmitEdited={handleFormSubmitEdited}
            handleDelete={handleDelete}
            idCompleatedArr={idCompleatedArr}
            setEditTodo={setEditTodo}
            editTodo={editTodo}
          />
        )}

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <Footer
            todos={todos}
            filter={filter}
            setFilter={setFilter}
            handleClearCompleted={handleClearCompleted}

          />
        )}
      </div>

      {/* Notification is shown in case of any error */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <ErrorBin
        setErrorMessage={setErrorMessage}
        errorMessage={errorMessage}
      />

    </div>

  // <section className="section container">
  //   <p className="title is-4">
  //     Copy all you need from the prev task:
  //     <br />
  //     <a href="https://github.com/mate-academy/react_todo-app-loading-todos#react-todo-app-load-todos">React Todo App - Load Todos</a>
  //   </p>

  //   <p className="subtitle">Styles are already copied</p>
  // </section>
  );
};
