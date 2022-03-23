const express = require('express')
const {v4: uuidv4} = require ('uuid')
const app = express()
app.use(express.json())

//Middleware
function verifyExistAccountCPF(request, response, next){
  const {cpf} = request.headers
  const customer = customers.find(customer => customer.cpf === cpf)
  if (!customer) {
    return response.status(400).json({error: "Customers not found"})
  }
  request.customer = customer
  return next()
}

getBalance = (statement) => {
  const balance=statement.reduce((acc, operation) =>{
    if(operation.type === 'credit'){
      return acc+operation.amount
    }else{
      return acc-operation.amount
    }
  }, 0)
  return balance
}

const customers = []
app.post("/account", (request, response) => {
  const {name, cpf} = request.body
  const customersAlreadyExists = customers.some(
    (customers) => customers.cpf === cpf
  )
  if (customersAlreadyExists){
    return response.status(400).json({error: "Customers already exists!"})
  }
  customers.push({
    id: uuidv4(),
    name,
    cpf,
    statement: []
  })
  return response.status(201).json({Contas: customers}).send()
  
})
app.get('/', (request, response)=>{
  return response.status(200).json(customers)
})
app.use(verifyExistAccountCPF)

app.get("/statement", (request, response) => {
  const { customer } = request
  return response.json(customer.statement)
})
app.get("/account", (request, response) => {
  const { customer } = request
  return response.json(customer)
})

app.post("/deposit", (request, response) => {
  const {description, amount} = request.body
  const { customer } = request
  const statementOperation = {
    description,
    amount,
    created_at : new Date(),
    type: "credit"
  }
  customer.statement.push(statementOperation)
  return response.status(201).json([customer.statement]).send()
})

app.post("/withdraw", (request, response) => {
  const { amount } = request.body
  const { customer } = request
  const balance = getBalance(customer.statement)
  if ( balance < amount ) {
    return response.status(400).json({error: "Insufficient founds"})
  }
  const statementOperation = {
    amount,
    created_at : new Date(),
    type: "debit"
  }
  customer.statement.push(statementOperation)
  return response.status(201).json([customer.statement]).send()
})

app.get("/statement/date", (request, response) => {
  const { customer } = request
  const { date } = request.query
  const dateFormat = new Date(date + " 00:00")
  const statement = customer.statement.filter((statement)=> statement.created_at.toDateString()=== new Date(dateFormat).toDateString())
  return response.json(statement)
})

app.put("/account", (request, response) => {
  const{name} = request.body
  const {customer} = request
  customer.name = name
  return response.status(201).json(customer.name)
})

app.delete("/account", (request, response) => {
  const{customer} = request
  customers.splice(customer, 1)
  return response.status(200).json(customers)
})
app.get ("/balance", (request, response)=>{
  const {customer} = request
  const balance = getBalance(customer.statement)
  return response.status(200).json({saldo: balance})
})
app.listen(3333, ()=>{console.log("Servidor Rodando...")})