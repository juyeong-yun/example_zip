import React, {useState, useEffect} from 'react';
import {getOneAdvice} from './utils/getAdvice.js'
import { getTodos, addTodo, updateClear, deleteOne} from './service/dbService.js';

import Advice from './components/advice.js';
import TodoInput from './components/todoInput.js';
import TodoList from './components/todoList.js';

import './App.css';
import './reset.css';

import checkmark from './images/checkmark.png';

function App() {
  const [checkedItems, setCheckedItems] = useState([]);
  const [todos, setTodos] = useState([]);
  const [newToDo, setNewToDo] = useState('');
  const [clears, setClears] = useState([]);
  const [advice, setAdvice] = useState('');

  useEffect(() => {
    // 새로고침마다 랜덤 하나의 조언 가져오기
    const fetchAdvice = async ()=>{
      const advice = await getOneAdvice();
      setAdvice(advice);
    } 
    fetchAdvice();

    const fetchTodos = async () => {
      try{
        const todosAll = await getTodos();
        
        const todos = todosAll.filter(todo => todo.clear === 0);
        const clear = todosAll.filter(todo => todo.clear === 1);
        
        setTodos(todos); 
        setClears(clear);
      } catch (error){
        console.error('Error fetching todos: ', error);
      }
    };
    fetchTodos();
  }, []);
  
  // todos 배열의 길이가 변경될 때마다 체크 상태를 초기화
  useEffect(()=> {
    setCheckedItems(Array(todos.length).fill(false)); 
    /**
     * Array(todos.length) : todos 의 길이만큼 새 배열을 생성
     * .fill(false) : 배열의 모든 요소를 false 로 채워 체크박스의 상태를 false 로 만드는 것
     */
  },[todos]);
  
  const addNewToDo = async() => {
    if(todos.length >= 7) {
      alert("리스트는 최대 7개까지만 가능합니다.");
      setNewToDo("");
      return;
    }

    if(newToDo.trim()){
      try{
        const date = new Date().toLocaleDateString(); 
        const newTodoRes = await addTodo(newToDo,date);
        if (newTodoRes){
          const newItem = {todo : newToDo, date : date,};
          // console.log(newItem);
          // 앞에 배열에 전부 들어갈 수 있도록 처리
          setTodos([...todos, newItem]);
          setNewToDo("");
        }
      } catch (error){
        console.error('Error adding new todo: ', error);
      }
    }
  };

  const deleteToDo = async(id) => {
    try{
      const item = todos.find(todo => todo.id === id);
      if(item){
        await deleteOne(id);
        // 삭제가 성공적으로 이루어졌으면 상태 업데이트
        const updatedTodos = todos.filter(todo => todo.id !== id);
        console.log('Updated todos:', updatedTodos);
        
        setTodos(updatedTodos);
      }
    }catch (error){
      console.error('Failed to delete todo: ', error);
    }
  };

  const moveClear = async(id) => {
    // console.log(id);
    try{
      const item = todos.find(todo => todo.id === id);
      if(item){
        item.clear = 1; // 로컬에서 상태 변경
        await updateClear(id);

        // 목록에 추가 후 삭제
        setClears([...clears, item]);
        setTodos(todos.filter(todo => todo.id !== id));
      } else {
        console.log('todo not find');
      }
    } catch (error){
      console.error('Failed to move clear: ', error);
    }
  };

  // 체크박스를 클릭하면 해당 항목을 체크 상태로 갱신
  const handleCheckboxChange = (id) => {
    // 체크박스 클릭 시 moveClear 함수 호출하여 항목을 clears로 이동
    moveClear(id);
  };

  return (
    <div className='content'>
      <div className='head'>
        <div className='title'>
          <img src={checkmark} alt='' />
          <h2>To Do List</h2>
        </div>
        <p>오늘 당신의 해야만 하는 일은 무엇인가요?</p>
      </div>
      
      {/*  JSX 요소는 반드시 하나의 부모 요소로 감싸져야 하기 때문에 div 태그가 남은것 */}
      <div className='write'>
        <TodoInput addNewToDo={addNewToDo} setNewToDo={setNewToDo} newToDo={newToDo} />
      </div>
      
      <Advice advice={advice} />
      
      <TodoList todos={todos} 
      clears={clears} 
      checkedItems={checkedItems} 
      handleCheckBoxChange={handleCheckboxChange} 
      deleteToDo={deleteToDo} />
      
    </div>
  );
}

export default App;
