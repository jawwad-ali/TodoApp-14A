import React, { useState, useRef, useEffect } from "react"
import { addTodo } from "../graphql/mutations"
import { getTodo } from "../graphql/queries"
import { API } from "aws-amplify"
import 'bootstrap/dist/css/bootstrap.min.css';
import "./style.css"

interface Todo {
  desc: string
  title: string
}

interface incomingData {
  data: {
    getTodo: Todo[] 
  }
}

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [todoData, setTodoData] = useState<incomingData | null>(null)

  const todoTitleRef = useRef<any>("")
  const descRef = useRef<any>("")

  const fetchTodos = async () => {
    try {
      const data = await API.graphql({
        query: getTodo,
      })

      setTodoData(data as incomingData)
      setLoading(false)
    }
    catch (e) {
      console.log(e)
    }
  }

  const addTodoMutation = async () => {
    try {
      const todo = {
        title: todoTitleRef.current.value,
        desc: descRef.current.value,
      }

      const data = await API.graphql({
        query: addTodo,
        variables: {
          todo: todo,
        },
      })

      todoTitleRef.current.value = ""
      descRef.current.value = ""
      fetchTodos()
    }
    catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])


  return (
    <main>
      <div className="container-fluid px-0 ">
        <div className="text-center bg-primary py-2 text-white heading-div">
          <h1 className="text-uppercase">14A Todo Application</h1>
        </div>

        <div className="row no-gutters">
          <div className="col-lg-6 mt-3 offset-lg-3">
            <input ref={todoTitleRef} className="form-control" placeholder="Todo Title" /> <br />
            <input ref={descRef} className="form-control" placeholder="Todo Description" />
            <br />
            <button className="btn btn-primary" onClick={() => addTodoMutation()}>Create Todo</button>
          </div>
        </div>
      </div>


      <div className="container main-container">
        <div className="row">
          {
            todoData &&
            todoData.data &&
            todoData.data.getTodo.map((item, ind) => {
              return (
                <div className="col-lg-5 mt-1 ml-5 mb-3 data-container" key={ind}>

                  <div className="data-left-div">
                    <h5 className="text-uppercase">{item.title}</h5>
                    <p>{item.desc}</p>
                  </div>

                </div>
              )
            })}
        </div>
      </div>
    </main >


    // <div>
    //   {loading ? (
    //     <h1>Loading ...</h1>
    //   ) : (
    //     <div>
    //       <label>
    //         Todo:
    //         <input ref={todoTitleRef} />
    //       </label>
    //       <label>
    //         Desc:
    //         <input ref={descRef} />
    //       </label>
    //        <button onClick={() => addTodoMutation()}>Create Todo</button>

    //       {todoData.data &&
    //         todoData.data.getTodo.map((item, ind) => (
    //           <div key={ind}>
    //           <div style={{ marginLeft: "1rem", marginTop: "2rem" }} >
    //             {item.title}
    //           </div>
    //             <div style={{ marginLeft: "1rem", marginTop: "2rem" }}>
    //             {item.desc}
    //           </div>

    //           </div>
    //         ))}
    //     </div> 
    //   )}
    // </div>
  )
}