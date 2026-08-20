import { useEffect } from "react";
import { testSupabaseConnection } from "./lib/testSupabase";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Collections from "./pages/Collections";
import Receipts from "./pages/Receipts";
import Expenses from "./pages/Expenses";
import Ledger from "./pages/Ledger";
import Reports from "./pages/Reports";
import Transparency from "./pages/Transparency";
import Settings from "./pages/Settings";

import "./App.css";


function App() {
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* PROTECTED APPLICATION */}

        <Route
          element={
            <DashboardLayout />
          }
        >

          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />

          <Route
            path="/members"
            element={
              <Members />
            }
          />

          <Route
            path="/collections"
            element={
              <Collections />
            }
          />

          <Route
            path="/receipts"
            element={
              <Receipts />
            }
          />

          <Route
            path="/expenses"
            element={
              <Expenses />
            }
          />

          <Route
            path="/ledger"
            element={
              <Ledger />
            }
          />

          <Route
            path="/reports"
            element={
              <Reports />
            }
          />

          <Route
            path="/transparency"
            element={
              <Transparency />
            }
          />

          <Route
            path="/settings"
            element={
              <Settings />
            }
          />

        </Route>


        {/* DEFAULT */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* UNKNOWN ROUTE */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;