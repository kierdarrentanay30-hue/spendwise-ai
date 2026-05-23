import { useState, useEffect } from "react"
import axios from "axios"
import jsPDF from "jspdf"
import { Menu } from "lucide-react"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"

function App() {

  // =====================================
  // AUTH
  // =====================================
  const [isRegister, setIsRegister] = useState(false)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [user, setUser] = useState(null)

  const [message, setMessage] = useState("")
  const [suggestedPassword, setSuggestedPassword] = useState("")

  // =====================================
  // SETTINGS
  // =====================================
  const [darkMode, setDarkMode] = useState(false)

  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")

  // =====================================
  // SIDEBAR
  // =====================================
  const [activePage, setActivePage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // =====================================
  // EXPENSES
  // =====================================
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")

  const [editingExpenseId, setEditingExpenseId] = useState(null)

  // =====================================
  // BUDGETS
  // =====================================
  const [budgetCategory, setBudgetCategory] = useState("")
  const [budgetLimit, setBudgetLimit] = useState("")

  // =====================================
  // DATA
  // =====================================
  const [expenses, setExpenses] = useState([])
  const [alerts, setAlerts] = useState([])
  const [budgets, setBudgets] = useState([])
  const [predictions, setPredictions] = useState([])

  const [totalExpenses, setTotalExpenses] = useState(0)
  const [categoryData, setCategoryData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])

  const [aiInsight, setAiInsight] = useState(null)

  // =====================================
  // COLORS
  // =====================================
  const COLORS = [
    "#2563eb",
    "#16a34a",
    "#dc2626",
    "#ca8a04",
    "#9333ea"
  ]

  // =====================================
  // REGISTER
  // =====================================
  const registerUser = async () => {

    try {

      const response = await axios.post(
        "http://192.168.1.6:8000/register",
        {
          full_name: fullName,
          email,
          password
        }
      )

      setMessage(response.data.message)

      if (response.data.success === false) {

        setSuggestedPassword(
          response.data.suggested_password
        )

      } else {

        alert("Registration Successful!")

        setSuggestedPassword("")

        setIsRegister(false)
      }

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // LOGIN
  // =====================================
  const loginUser = async () => {

    try {

      const response = await axios.post(
        "http://192.168.1.6:8000/login",
        {
          email,
          password
        }
      )

      if (response.data.user) {

        setUser(response.data.user)

        refreshDashboard(response.data.user.id)
      }

      alert(response.data.message)

    } catch (error) {

      console.log(error)

      alert("Login Failed")
    }
  }

  // =====================================
  // REFRESH
  // =====================================
  const refreshDashboard = (userId = user.id) => {

    fetchExpenses(userId)
    fetchDashboard(userId)
    fetchPredictions(userId)
    fetchAlerts(userId)
    fetchBudgets(userId)
    fetchAIInsights(userId)
  }

  // =====================================
  // FETCH EXPENSES
  // =====================================
  const fetchExpenses = async (userId) => {

    try {

      const response = await axios.get(
        `http://192.168.1.6:8000/expenses/${userId}`
      )

      setExpenses(response.data.expenses)

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // FETCH DASHBOARD
  // =====================================
  const fetchDashboard = async (userId) => {

    try {

      const response = await axios.get(
        `http://192.168.1.6:8000/dashboard/${userId}`
      )

      setTotalExpenses(response.data.total_expenses)

      setCategoryData(response.data.categories)

      setMonthlyData(response.data.categories)

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // FETCH ALERTS
  // =====================================
  const fetchAlerts = async (userId) => {

    try {

      const response = await axios.get(
        `http://192.168.1.6:8000/budget-alerts/${userId}`
      )

      setAlerts(response.data.alerts)

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // FETCH BUDGETS
  // =====================================
  const fetchBudgets = async (userId) => {

    try {

      const response = await axios.get(
        `http://192.168.1.6:8000/budgets/${userId}`
      )

      setBudgets(response.data.budgets)

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // FETCH PREDICTIONS
  // =====================================
  const fetchPredictions = async (userId) => {

    try {

      const response = await axios.get(
        `http://192.168.1.6:8000/prediction/${userId}`
      )

      setPredictions(response.data.predictions)

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // FETCH AI INSIGHTS
  // =====================================
  const fetchAIInsights = async (userId) => {

    try {

      const response = await axios.get(
        `http://192.168.1.6:8000/ai-insights/${userId}`
      )

      setAiInsight(response.data)

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // ADD EXPENSE
  // =====================================
  const addExpense = async () => {

    const expenseData = {
      user_id: user.id,
      category,
      amount,
      description,
      expense_date: new Date().toISOString().split("T")[0]
    }

    // OFFLINE MODE
    if (!navigator.onLine) {

      const offlineExpenses =
        JSON.parse(localStorage.getItem("offlineExpenses")) || []

      offlineExpenses.push(expenseData)

      localStorage.setItem(
        "offlineExpenses",
        JSON.stringify(offlineExpenses)
      )

      alert("Offline: Expense saved locally!")

      setCategory("")
      setAmount("")
      setDescription("")

      return
    }

    // ONLINE MODE
    try {

      const response = await axios.post(
        "http://192.168.1.6:8000/add-expense",
        expenseData
      )

      alert(response.data.message)

      refreshDashboard()

      setCategory("")
      setAmount("")
      setDescription("")

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // UPDATE EXPENSE
  // =====================================
  const updateExpense = async () => {

    try {

      const response = await axios.put(
        `http://192.168.1.6:8000/update-expense/${editingExpenseId}`,
        {
          user_id: user.id,
          category,
          amount,
          description,
          expense_date: new Date().toISOString().split("T")[0]
        }
      )

      alert(response.data.message)

      refreshDashboard()

      setEditingExpenseId(null)

      setCategory("")
      setAmount("")
      setDescription("")

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // DELETE EXPENSE
  // =====================================
  const deleteExpense = async (expenseId) => {

    try {

      const response = await axios.delete(
        `http://192.168.1.6:8000/delete-expense/${expenseId}`
      )

      alert(response.data.message)

      refreshDashboard()

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // ADD BUDGET
  // =====================================
  const addBudget = async () => {

    try {

      const response = await axios.post(
        "http://192.168.1.6:8000/add-budget",
        {
          user_id: user.id,
          category: budgetCategory,
          budget_limit: budgetLimit
        }
      )

      alert(response.data.message)

      refreshDashboard()

      setBudgetCategory("")
      setBudgetLimit("")

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // CHANGE EMAIL
  // =====================================
  const changeEmail = async () => {

    try {

      const response = await axios.put(
        "http://192.168.1.6:8000/change-email",
        {
          user_id: user.id,
          new_email: newEmail
        }
      )

      alert(response.data.message)

      setUser({
        ...user,
        email: newEmail
      })

      setNewEmail("")

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // CHANGE PASSWORD
  // =====================================
  const changePassword = async () => {

    try {

      const response = await axios.put(
        "http://192.168.1.6:8000/change-password",
        {
          user_id: user.id,
          new_password: newPassword
        }
      )

      alert(response.data.message)

      setNewPassword("")

    } catch (error) {

      console.log(error)
    }
  }

  // =====================================
  // PDF REPORT
  // =====================================
  const generatePDF = () => {

    const doc = new jsPDF()

    // HEADER
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)

    doc.text("SpendWise AI Financial Report", 20, 20)

    // USER INFO
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")

    doc.text(`User: ${user.full_name}`, 20, 35)

    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      20,
      43
    )

    // LINE
    doc.line(20, 50, 190, 50)

    // TOTAL EXPENSES
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)

    doc.text(
      `Total Expenses: PHP ${totalExpenses}`,
      20,
      65
    )

    // EXPENSE HISTORY TITLE
    doc.setFontSize(14)

    doc.text("Expense History", 20, 85)

    // TABLE HEADER
    let y = 100

    doc.setFontSize(12)

    doc.setFont("helvetica", "bold")

    doc.text("Category", 20, y)
    doc.text("Amount", 90, y)
    doc.text("Description", 140, y)

    y += 8

    doc.line(20, y, 190, y)

    y += 10

    // TABLE CONTENT
    doc.setFont("helvetica", "normal")

    expenses.forEach((expense) => {

      doc.text(expense.category, 20, y)

      doc.text(
        `PHP ${expense.amount}`,
        90,
        y
      )

      doc.text(
        expense.description || "-",
        140,
        y
      )

      y += 10

      // AUTO NEW PAGE
      if (y > 270) {

        doc.addPage()

        y = 20
      }
    })

    // FOOTER
    doc.setFontSize(10)

    doc.text(
      "Generated by SpendWise AI",
      20,
      290
    )

    doc.save("SpendWise_Report.pdf")
  }

  // =====================================
  // DASHBOARD
  // =====================================
  useEffect(() => {

    const syncOfflineExpenses = async () => {

      const offlineExpenses =
        JSON.parse(localStorage.getItem("offlineExpenses")) || []

      if (offlineExpenses.length > 0 && navigator.onLine) {

        for (const expense of offlineExpenses) {

          try {

            await axios.post(
              "http://192.168.1.6:8000/add-expense",
              expense
            )

          } catch (error) {

            console.log(error)
          }
        }

        localStorage.removeItem("offlineExpenses")

        refreshDashboard()

        alert("Offline expenses synced!")
      }
    }

    window.addEventListener("online", syncOfflineExpenses)

    syncOfflineExpenses()

    return () => {
      window.removeEventListener("online", syncOfflineExpenses)
    }

  }, [])


  if (user) {

    return (

      <div className={`min-h-screen flex ${darkMode
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-black"
        }`}>

        {/* MOBILE MENU */}
        <button
          className={`md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg ${sidebarOpen ? "hidden" : "block"
            }`}
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* SIDEBAR */}
        <div className={`
          fixed top-0 left-0 w-64 h-screen overflow-y-auto
          ${darkMode ? "bg-gray-800" : "bg-white"}
          shadow-xl z-40 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}>

          <div className="p-6">

            <h1 className="text-2xl font-bold text-blue-600 mb-8">
              SpendWise AI
            </h1>

            <div className="flex flex-col gap-4">

              <button
                onClick={() => {
                  setActivePage("dashboard")
                  setSidebarOpen(false)
                }}
                className="text-left hover:text-blue-600"
              >
                DASHBOARD
              </button>

              <button
                onClick={() => {
                  setActivePage("expenses")
                  setSidebarOpen(false)
                }}
                className="text-left hover:text-blue-600"
              >
                ADD EXPENSES
              </button>

              <button
                onClick={() => {
                  setActivePage("alerts")
                  setSidebarOpen(false)
                }}
                className="text-left hover:text-blue-600"
              >
                ALERTS
              </button>

              <button
                onClick={() => {
                  setActivePage("predictions")
                  setSidebarOpen(false)
                }}
                className="text-left hover:text-blue-600"
              >
                AI PREDICTIONS
              </button>

              <button
                onClick={() => {
                  setActivePage("history")
                  setSidebarOpen(false)
                }}
                className="text-left hover:text-blue-600"
              >
                HISTORY
              </button>

              <button
                onClick={() => {
                  setActivePage("settings")
                  setSidebarOpen(false)
                }}
                className="text-left hover:text-blue-600"
              >
                SETTINGS
              </button>

              <button
                onClick={() => setUser(null)}
                className="text-left text-red-600 mt-8"
              >
                LOGOUT
              </button>

            </div>

          </div>

        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-6 md:ml-64 ml-0">

          {/* DASHBOARD */}
          {
            activePage === "dashboard" && (

              <div>

                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md rounded-xl p-6 mb-6`}>

                  <h1 className="text-3xl font-bold text-blue-600">
                    SpendWise AI Dashboard
                  </h1>

                  <p className="mt-2">
                    Welcome, {user.full_name}
                  </p>

                </div>

                {/* CARDS */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">

                  <div className="bg-blue-600 text-white p-6 rounded-xl">
                    <h2>Total Expenses</h2>
                    <p className="text-3xl font-bold">
                      ₱{totalExpenses}
                    </p>
                  </div>

                  <div className="bg-green-600 text-white p-6 rounded-xl">
                    <h2>Budgets</h2>
                    <p className="text-3xl font-bold">
                      {budgets.length}
                    </p>
                  </div>

                  <div className="bg-red-600 text-white p-6 rounded-xl">
                    <h2>Alerts</h2>
                    <p className="text-3xl font-bold">
                      {alerts.length}
                    </p>
                  </div>

                </div>

                {/* PDF */}
                <button
                  onClick={generatePDF}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl mb-6"
                >
                  Download PDF Report
                </button>

                {/* PIE CHART */}
                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6 mb-6`}>

                  <h2 className="text-2xl font-semibold mb-4">
                    Spending Analytics
                  </h2>

                  <ResponsiveContainer width="100%" height={350}>

                    <PieChart>

                      <Pie
                        data={categoryData}
                        dataKey="total"
                        nameKey="category"
                        outerRadius={100}
                        label
                      >

                        {
                          categoryData.map((entry, index) => (

                            <Cell
                              key={index}
                              fill={COLORS[index % COLORS.length]}
                            />

                          ))
                        }

                      </Pie>

                      <Tooltip />
                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

                {/* LINE CHART */}
                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6 mb-6`}>

                  <h2 className="text-2xl font-semibold mb-4">
                    Expense Trends
                  </h2>

                  <ResponsiveContainer width="100%" height={350}>

                    <LineChart data={monthlyData}>

                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="category" />

                      <YAxis />

                      <Tooltip />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#2563eb"
                        strokeWidth={3}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>

                {/* AI INSIGHTS */}
                {
                  aiInsight && (

                    <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6`}>

                      <h2 className="text-2xl font-semibold mb-4">
                        AI Financial Insights
                      </h2>

                      <h3 className="text-xl font-bold text-blue-600">
                        {aiInsight.highest_category}
                      </h3>

                      <p className="mt-2">
                        ₱{aiInsight.highest_amount}
                      </p>

                      <div className="mt-4 bg-yellow-100 text-yellow-700 p-4 rounded-xl">
                        {aiInsight.recommendation}
                      </div>

                    </div>

                  )
                }

              </div>

            )
          }

          {/* ADD EXPENSES */}
          {
            activePage === "expenses" && (

              <div className="space-y-6">

                {/* EXPENSE FORM */}
                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6`}>

                  <h2 className="text-2xl font-semibold mb-4">

                    {
                      editingExpenseId
                        ? "Edit Expense"
                        : "Add Expense"
                    }

                  </h2>

                  <div className="grid gap-4">

                    <input
                      type="text"
                      placeholder="Category"
                      value={category}
                      className="border p-3 rounded-lg text-black"
                      onChange={(e) => setCategory(e.target.value)}
                    />

                    <input
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      className="border p-3 rounded-lg text-black"
                      onChange={(e) => setAmount(e.target.value)}
                    />

                    <input
                      type="text"
                      placeholder="Description"
                      value={description}
                      className="border p-3 rounded-lg text-black"
                      onChange={(e) => setDescription(e.target.value)}
                    />

                    <button
                      onClick={
                        editingExpenseId
                          ? updateExpense
                          : addExpense
                      }
                      className={`text-white p-3 rounded-lg ${editingExpenseId
                          ? "bg-yellow-600"
                          : "bg-blue-600"
                        }`}
                    >

                      {
                        editingExpenseId
                          ? "Update Expense"
                          : "Add Expense"
                      }

                    </button>

                  </div>

                </div>

                {/* BUDGET FORM */}
                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6`}>

                  <h2 className="text-2xl font-semibold mb-4">
                    Set Budget Limit
                  </h2>

                  <div className="grid gap-4">

                    <input
                      type="text"
                      placeholder="Category"
                      value={budgetCategory}
                      className="border p-3 rounded-lg text-black"
                      onChange={(e) => setBudgetCategory(e.target.value)}
                    />

                    <input
                      type="number"
                      placeholder="Budget Limit"
                      value={budgetLimit}
                      className="border p-3 rounded-lg text-black"
                      onChange={(e) => setBudgetLimit(e.target.value)}
                    />

                    <button
                      onClick={addBudget}
                      className="bg-green-600 text-white p-3 rounded-lg"
                    >
                      Save Budget
                    </button>

                  </div>

                </div>

              </div>

            )
          }

          {/* ALERTS */}
          {
            activePage === "alerts" && (

              <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6`}>

                <h2 className="text-2xl font-semibold mb-4">
                  Budget Alerts
                </h2>

                {
                  alerts.map((alert, index) => (

                    <div
                      key={index}
                      className="bg-red-100 text-red-700 p-4 rounded-xl mb-4"
                    >

                      <h3 className="font-bold">
                        {alert.category}
                      </h3>

                      <p>{alert.message}</p>

                    </div>

                  ))
                }

              </div>

            )
          }

          {/* PREDICTIONS */}
          {
            activePage === "predictions" && (

              <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6`}>

                <h2 className="text-2xl font-semibold mb-4">
                  AI Predictions
                </h2>

                {
                  predictions.map((item, index) => (

                    <div
                      key={index}
                      className="border p-4 rounded-xl mb-4"
                    >

                      <h3 className="font-bold text-blue-600">
                        {item.category}
                      </h3>

                      <p>
                        ₱{item.predicted_amount}
                      </p>

                    </div>

                  ))
                }

              </div>

            )
          }

          {/* HISTORY */}
          {
            activePage === "history" && (

              <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6`}>

                <h2 className="text-2xl font-semibold mb-4">
                  Expense History
                </h2>

                {
                  expenses.map((expense) => (

                    <div
                      key={expense.id}
                      className="border p-4 rounded-xl mb-4"
                    >

                      <div className="flex justify-between">

                        <h3 className="font-bold">
                          {expense.category}
                        </h3>

                        <span className="text-green-600 font-bold">
                          ₱{expense.amount}
                        </span>

                      </div>

                      <p className="mt-2">
                        {expense.description}
                      </p>

                      <p className="text-sm text-gray-500 mt-2">
                        {expense.expense_date}
                      </p>

                      <div className="flex gap-4 mt-4">

                        <button

                          onClick={() => {

                            setEditingExpenseId(expense.id)

                            setCategory(expense.category)

                            setAmount(expense.amount)

                            setDescription(expense.description)

                            setActivePage("expenses")

                          }}

                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                        >
                          Edit
                        </button>

                        <button

                          onClick={() => deleteExpense(expense.id)}

                          className="bg-red-600 text-white px-4 py-2 rounded-lg"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  ))
                }

              </div>

            )
          }

          {/* SETTINGS */}
          {
            activePage === "settings" && (

              <div className="space-y-6">

                {/* PROFILE */}
                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6`}>

                  <h2 className="text-2xl font-semibold mb-4">
                    Profile Settings
                  </h2>

                  <p>
                    <strong>Name:</strong> {user.full_name}
                  </p>

                  <p className="mt-2">
                    <strong>Email:</strong> {user.email}
                  </p>

                </div>

                {/* DARK MODE */}
                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6`}>

                  <h2 className="text-2xl font-semibold mb-4">
                    Appearance
                  </h2>

                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="bg-black text-white px-6 py-3 rounded-xl"
                  >
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </button>

                </div>

                {/* CHANGE EMAIL */}
                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6`}>

                  <h2 className="text-2xl font-semibold mb-4">
                    Change Email
                  </h2>

                  <div className="grid gap-4">

                    <input
                      type="email"
                      placeholder="New Email"
                      value={newEmail}
                      className="border p-3 rounded-lg text-black"
                      onChange={(e) => setNewEmail(e.target.value)}
                    />

                    <button
                      onClick={changeEmail}
                      className="bg-blue-600 text-white p-3 rounded-lg"
                    >
                      Update Email
                    </button>

                  </div>

                </div>

                {/* CHANGE PASSWORD */}
                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6`}>

                  <h2 className="text-2xl font-semibold mb-4">
                    Change Password
                  </h2>

                  <div className="grid gap-4">

                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      className="border p-3 rounded-lg text-black"
                      onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <button
                      onClick={changePassword}
                      className="bg-green-600 text-white p-3 rounded-lg"
                    >
                      Update Password
                    </button>

                  </div>

                </div>

              </div>

            )
          }

        </div>

      </div>
    )
  }

  // =====================================
  // LOGIN / REGISTER
  // =====================================
  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-[400px]">

        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">

          {
            isRegister
              ? "Create Account"
              : "Login"
          }

        </h1>

        <div className="flex flex-col gap-4">

          {
            isRegister && (

              <input
                type="text"
                placeholder="Full Name"
                className="border p-3 rounded-lg"
                onChange={(e) => setFullName(e.target.value)}
              />

            )
          }

          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-lg"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-lg"
            onChange={(e) => setPassword(e.target.value)}
          />

          {
            message && (

              <div className="bg-yellow-100 text-yellow-700 p-3 rounded-lg">
                {message}
              </div>

            )
          }

          {
            suggestedPassword && (

              <div className="bg-green-100 text-green-700 p-3 rounded-lg">

                <p className="font-bold">
                  Suggested Password:
                </p>

                <p>
                  {suggestedPassword}
                </p>

              </div>

            )
          }

          <button
            onClick={
              isRegister
                ? registerUser
                : loginUser
            }
            className="bg-blue-600 text-white p-3 rounded-lg"
          >

            {
              isRegister
                ? "Register"
                : "Login"
            }

          </button>

          <button
            onClick={() => {

              setIsRegister(!isRegister)

              setMessage("")
              setSuggestedPassword("")

            }}
            className="text-blue-600"
          >

            {
              isRegister
                ? "Already have an account? Login"
                : "No account yet? Register"
            }

          </button>

        </div>

      </div>

    </div>
  )
}

export default App