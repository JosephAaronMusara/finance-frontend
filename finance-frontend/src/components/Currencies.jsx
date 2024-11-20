import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { fetchRates } from "../features/dataSlice";
import axios from "../api";

const CurrencyCrud = () => {
  const [currency, setCurrency] = useState({
    currency_code: "",
    name: "",
    rwf_equivalent: "",
  });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state for rates
  const rates = useSelector((state) => state.data.rates);

  // Fetch rates on component mount
  useEffect(() => {
    dispatch(fetchRates());
  }, [dispatch]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrency((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`currency/${currency.id}/`, currency);
        window.location.reload();
      } else {
        try {
          await axios.post(`currency/`, currency);
          window.location.reload();
        } catch (error) {
          console.error("Error creating data:", error);
        }
      }
      setCurrency({ currency_code: "", name: "", rwf_equivalent: "" });
      setEditing(false);
    } catch (err) {
      setError("Error saving currency");
    }
  };

  // Handle edit button click
  const handleEdit = (currencyData) => {
    setCurrency(currencyData);
    setEditing(true);
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/">Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/" className="nav-link">
              <i className="bi bi-house-fill me-2"></i> Home
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/bankbalance")}>
              <i className="bi bi-bank me-2"></i> Bank Balances
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/account-receivables")}>
              <i className="bi bi-graph-up-arrow"></i>Account Receivables
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/expense")} className="nav-link">
              <i className="bi bi-cash-coin"></i> Expenses
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className="container my-5">
        <h1 className="text-center mb-4">Currency Management</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="row mb-3">
            <div className="col-md-4">
              <input
                type="text"
                name="currency_code"
                value={currency.currency_code}
                onChange={handleChange}
                className="form-control"
                placeholder="Currency Code"
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="name"
                value={currency.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Currency Name"
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="number"
                name="rwf_equivalent"
                value={currency.rwf_equivalent}
                onChange={handleChange}
                className="form-control"
                placeholder="RWF Equivalent"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className={`btn ${editing ? "btn-warning" : "btn-primary"} w-100`}
          >
            {editing ? "Update Currency" : "Add Currency"}
          </button>
        </form>
        <h2 className="text-center mb-3">Currency List</h2>
        <ul className="list-group">
          {rates.map((currency) => (
            <li
              key={currency.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{currency.currency_code}</strong> - {currency.name} -{" "}
                {currency.rwf_equivalent}
              </div>
              <div>
                <button
                  className="btn btn-sm btn-info me-2"
                  onClick={() => handleEdit(currency)}
                >
                  <i className="bi bi-pencil-square"></i> Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CurrencyCrud;
