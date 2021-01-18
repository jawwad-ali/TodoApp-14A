import React , {useState , useRef , useEffect} from "react"
import { addTodo } from "../graphql/mutations"
import { getTodo } from "../graphql/queries"
import { API } from "aws-amplify"
import shortid from "shortid"

interface title {
  desc: string
  title: string
}

interface incomingData {
  data: {
    getTodo: title[]
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
  

  return(
    <div>
      hello
      {loading ? (
        <h1>Loading ...</h1>
      ) : (
        <div>
          <label>
            Todo:
            <input ref={todoTitleRef} />
          </label>
          <label>
            Desc:
            <input ref={descRef} />
          </label>
           <button onClick={() => addTodoMutation()}>Create Todo</button>
          
          {todoData.data &&
            todoData.data.getTodo.map((item, ind) => (
              <div>
              <div style={{ marginLeft: "1rem", marginTop: "2rem" }} key={ind}>
                {item.title}
              </div>
                <div style={{ marginLeft: "1rem", marginTop: "2rem" }} key={ind}>
                {item.desc}
              </div>
              </div>
            ))}
        </div>
      )}
    </div>
  ) 
}