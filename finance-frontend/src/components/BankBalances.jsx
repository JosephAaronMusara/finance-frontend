/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchExpenses,
  fetchBankBalances,
  fetchRates,
} from "../features/dataSlice";
import axios from "../api";
import "./BankBalances.css";
import { Table, Button, Modal, Navbar, Nav, Form } from "react-bootstrap";

const BankBalances = () => {
  const [data, setData] = useState([]);
  const [odB, setOdB] = useState(0);
  const [totalCurrentAsserts, setTotalCurrentAsserts] = useState(0);
  const [totalUG, setTotalUG] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleCloseEdit = () => setShowEditModal(false);
  const handleShowEdit = (row) => {
    setCurrentRow(row);
    setFormData(row);
    setShowEditModal(true);
  };

  const handleShowCreate = () => {
    setFormData({});
    setShowCreateModal(true);
  };

  const handleCloseCreate = () => setShowCreateModal(false);

  const handleCloseDetails = () => setShowDetailsModal(false);
  const handleShowDetails = (row) => {
    setCurrentRow(row);
    setShowDetailsModal(true);
  };

  const [selectedOption, setSelectedOption] = useState("");

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`bankbalance/${currentRow.id}/`, formData);
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`bankbalance/`, formData);
      setShowCreateModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating data:", error);
    }
  };

  const dispatch = useDispatch();

  const handleFetchProjects = useCallback(() => {
    dispatch(fetchExpenses());
    dispatch(fetchBankBalances());
    dispatch(fetchRates());
  }, [dispatch]);

  useEffect(() => {
    handleFetchProjects();
  }, [handleFetchProjects]);

  const bankBalances = useSelector((state) => state.data.bankBalances);
  const rates = useSelector((state) => state.data.rates);
  const unutilizedGrant = bankBalances.filter(
    (grants) => grants.type === "Unutilized Grant"
  );
  const currentAssets = bankBalances.filter(
    (assets) => assets.type === "Current Asset"
  );
  const netCurrentAssets = bankBalances.filter(
    (assets) => assets.type === "NET CURRENT ASSET"
  );

  useEffect(() => {
    setTotalCurrentAsserts(
      currentAssets.reduce(
        (total, tCurrentAssets) =>
          total +
          parseFloat(tCurrentAssets.amount * tCurrentAssets.rwf_equivalent),
        0
      )
    );

    setTotalUG(
      unutilizedGrant.reduce(
        (total, tUG) => total + parseFloat(tUG.amount * tUG.rwf_equivalent),
        0
      )
    );

    const negativeEntry = bankBalances.find(
      (entry) => entry.name === "OD USAGE"
    );
    const positiveEntry = bankBalances.find(
      (entry) => entry.name === "OD SECURITY(USD)"
    );

    const negativeValue = negativeEntry
      ? parseFloat(negativeEntry.rwf_equivalent) *
        parseFloat(negativeEntry.amount)
      : 0;

    const positiveValue = positiveEntry
      ? parseFloat(positiveEntry.rwf_equivalent) *
        parseFloat(positiveEntry.amount)
      : 0;

    setOdB(positiveValue - negativeValue);
  }, [bankBalances]);

  const today = new Date();
  const formattedDate = `${today.getDate()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${today.getFullYear()}`;

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this entry?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(`bankbalance/${id}/`);
        const response = await axios.get("/bankbalance/");
        setData(response.data);
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
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
            <Nav.Link className="nav-link" onClick={handleShowCreate}>
              <i className="bi bi-plus"></i> Create
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/expense")} className="nav-link">
              <i className="bi bi-cash-coin"></i> Expenses
            </Nav.Link>
            <Nav.Link
              onClick={() => navigate("/account-receivables")}
              className="nav-link"
            >
              <i className="bi-graph-up-arrow"></i> Account Receivables
            </Nav.Link>
            <Nav.Link className="nav-link" onClick={() => navigate("/rates")}>
              <i className="bi bi-pencil-square"></i> Rates
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className="container mt-4">
        <h3 className="text-center mb-4">
          VANGUARD BANK BALANCES AS OF {formattedDate}
        </h3>

        <Table
          striped
          bordered
          hover
          responsive
          className="custom-table text-left"
        >
          <thead>
            <tr>
              <th style={{ width: "40%" }}>CASH AT BANK</th>
              <th style={{ width: "15%" }}>Amount</th>
              <th style={{ width: "10%" }}>Rate</th>
              <th style={{ width: "15%" }}>Amount in RWF</th>
            </tr>
          </thead>
          <tbody>
            {currentAssets.map((row) => (
              <tr key={row.id} onClick={() => handleShowDetails(row)}>
                <td>{row.name}</td>
                <th>{row.amount}</th>
                <th>{row.rwf_equivalent}</th>
                <th>{(row.amount * row.rwf_equivalent).toFixed(2)}</th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3">
                <strong>TOTAL CURRENT ASSETS</strong>
              </td>
              <td>{totalCurrentAsserts}</td>
            </tr>
          </tfoot>
        </Table>

        <Table striped bordered hover responsive className="custom-table">
          <thead>
            <tr>
              <th style={{ width: "40%" }}></th>
              <th style={{ width: "15%" }}></th>
              <th style={{ width: "10%" }}></th>
              <th style={{ width: "15%" }}></th>
            </tr>
          </thead>
          <tbody>
            {netCurrentAssets.map((row) => (
              <tr key={row.id} onClick={() => handleShowDetails(row)}>
                <td>{row.name}</td>
                <th>{row.amount}</th>
                <th>{row.rwf_equivalent}</th>
                <th>{(row.amount * row.rwf_equivalent).toFixed(2)}</th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3">BALANCE OF O/D</td>
              <td>{odB}</td>
            </tr>
            <tr>
              <td colSpan="3">
                <strong>NET CURRENT ASSETS/NET CASH IN BANK</strong>
              </td>
              <td>{odB}</td>
            </tr>
          </tfoot>
        </Table>

        <Table striped bordered hover responsive className="custom-table">
          <thead>
            <tr>
              <th style={{ width: "40%" }}></th>
              <th style={{ width: "15%" }}></th>
              <th style={{ width: "10%" }}></th>
              <th style={{ width: "15%" }}></th>
            </tr>
          </thead>
          <tbody>
            {unutilizedGrant.map((row) => (
              <tr key={row.id} onClick={() => handleShowDetails(row)}>
                <td>{row.name}</td>
                <th>{row.amount}</th>
                <th>{row.rwf_equivalent}</th>
                <th>{(row.amount * row.rwf_equivalent).toFixed(2)}</th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3">
                <strong>TOTAL UNUTILIZED GRANT</strong>
              </td>
              <td>{totalUG}</td>
            </tr>
          </tfoot>
        </Table>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Bank Balance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formBasicName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formBasicAmount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Amount"
                name="amount"
                value={formData.amount || ""}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formBasicRwf">
              <Form.Label>RWF Equivalent</Form.Label>
              <Form.Control
                type="number"
                placeholder="RWF Equivalent"
                name="rwf_equivalent"
                value={formData.rwf_equivalent || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Create Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreate}>
        <Modal.Header closeButton>
          <Modal.Title>Create Bank Balance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formBasicName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formBasicAmount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Amount"
                name="amount"
                value={formData.amount || ""}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formBasicType">
              <Form.Label>Currency</Form.Label>
              <Form.Control
                as="select"
                name="currency"
                value={formData.currency || ""}
                onChange={handleInputChange}
              >
                <option value="">Select Currency</option>
                {rates.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formBasicType">
              <Form.Label>Category</Form.Label>
              <Form.Control
                as="select"
                name="type"
                value={formData.category || ""}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                <option value="Current Asset">Current Asset</option>
                <option value="Unutilized Grant">Unutilized Grant</option>
                <option value="NET CURRENT ASSET">Net Current Asset</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreate}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            Create Bank Balance
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BankBalances;
