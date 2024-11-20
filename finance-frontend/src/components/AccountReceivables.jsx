/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAccountReceivable,
  fetchBankBalances,
} from "../features/dataSlice";
import axios from "../api";
import {
  Table,
  Button,
  Modal,
  Navbar,
  Nav,
  Pagination,
  Form,
} from "react-bootstrap";
import "./AccountReceivables.css";

const AccountReceivable = () => {
  const [data, setData] = useState([]);
  const [showReadOnlyModal, setShowReadOnlyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  const handleCloseReadOnly = () => setShowReadOnlyModal(false);
  const handleCloseEdit = () => setShowEditModal(false);
  const handleCloseCreate = () => setShowCreateModal(false);
  const handleShowCreate = () => {
    setFormData({});
    setShowCreateModal(true);
  };

  const handleRowClick = (row) => {
    setCurrentRow(row);
    setShowReadOnlyModal(true);
  };

  const handleShowEdit = () => {
    setFormData(currentRow);
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async () => {
    try {
      await axios.post("/accountreceivable/", formData);
      setShowCreateModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating data:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`accountreceivable/${currentRow.id}/`, formData);
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this entry?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(`accountreceivable/${currentRow.id}/`);
        setShowReadOnlyModal(false);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  const dispatch = useDispatch();

  const handleFetchProjects = useCallback(() => {
    dispatch(fetchAccountReceivable());
    dispatch(fetchBankBalances());
  }, [dispatch]);

  useEffect(() => {
    handleFetchProjects();
  }, [handleFetchProjects]);

  const accountreceivables = useSelector(
    (state) => state.data.accountReceivable
  );

  const totalaccountReceivables = accountreceivables.reduce(
    (total, item) => total + parseFloat(item.total_amount || 0),
    0
  );

  const balanceaccountReceivables = accountreceivables.reduce(
    (total, item) => total + parseFloat(item.balance || 0),
    0
  );

  const filteredData = accountreceivables.filter((row) =>
    row.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const today = new Date();
  const formattedDate = `${today.getDate()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${today.getFullYear()}`;

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/">Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/" className="nav-link">
              <i className="bi bi-house"></i> Home
            </Nav.Link>
            <Nav.Link className="nav-link" onClick={handleShowCreate}>
              <i className="bi bi-plus"></i> Create
            </Nav.Link>
            <Nav.Link
              className="nav-link"
              onClick={() => navigate("/bankbalance")}
            >
              <i className="bi bi-bank me-2"></i> Bank Balances
            </Nav.Link>
            <Nav.Link className="nav-link" onClick={() => navigate("/expense")}>
              <i className="bi bi-cash-coin"></i> Expenses
            </Nav.Link>
            <Nav.Link className="nav-link" onClick={() => navigate("/rates")}>
              <i className="bi bi-pencil-square"></i> Rates
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className="container mt-4">
        <h2 className="text-center mb-4">VANGUARD ECONOMICS LTD</h2>
        <p>ACCOUNT RECEIVABLES AGEING SUMMARY AS OF {formattedDate}</p>

        <Form.Control
          type="text"
          placeholder="Search by Customer Name..."
          className="mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Table striped bordered hover responsive className="custom-table">
          <thead>
            <tr>
              <th>Invoice Date</th>
              <th>Invoice Number</th>
              <th>Customer Name</th>
              <th>Total Amount</th>
              <th>Due Date</th>
              <th>Balance</th>
              <th>Service Type</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row) => (
              <tr
                key={row.id}
                onClick={() => handleRowClick(row)}
                style={{ cursor: "pointer" }}
              >
                <td>{row.invoice_date}</td>
                <td>{row.invoice_number}</td>
                <td>{row.customer_name}</td>
                <td>{row.total_amount}</td>
                <td>{row.due_date}</td>
                <td>{row.balance}</td>
                <td>{row.service_type}</td>
                <td>
                  {Math.round((row.balance / totalaccountReceivables) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3">
                <strong></strong>
              </td>
              <td>{totalaccountReceivables}</td>
              <td colSpan="1">
                <strong></strong>
              </td>
              <td>{balanceaccountReceivables}</td>
            </tr>
          </tfoot>
        </Table>

        <Pagination className="justify-content-center">
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>

      {/* Read-Only Modal */}
      <Modal show={showReadOnlyModal} onHide={handleCloseReadOnly}>
        <Modal.Header closeButton>
          <Modal.Title>Row Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentRow && (
            <div>
              <p>
                <strong>Invoice Date:</strong> {currentRow.invoice_date}
              </p>
              <p>
                <strong>Invoice Number:</strong> {currentRow.invoice_number}
              </p>
              <p>
                <strong>Customer Name:</strong> {currentRow.customer_name}
              </p>
              <p>
                <strong>Total Amount:</strong> {currentRow.total_amount}
              </p>
              <p>
                <strong>Due Date:</strong> {currentRow.due_date}
              </p>
              <p>
                <strong>Balance:</strong> {currentRow.balance}
              </p>
              <p>
                <strong>Service Type:</strong> {currentRow.service_type}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReadOnly}>
            Close
          </Button>
          <Button variant="warning" onClick={handleShowEdit}>
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreate}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="invoiceDate">
              <Form.Label>Invoice Date</Form.Label>
              <Form.Control
                type="date"
                name="invoice_date"
                value={formData.invoice_date || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="invoiceNumber">
              <Form.Label>Invoice Number</Form.Label>
              <Form.Control
                type="text"
                name="invoice_number"
                value={formData.invoice_number || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="customerName">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                name="customer_name"
                value={formData.customer_name || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="totalAmount">
              <Form.Label>Total Amount</Form.Label>
              <Form.Control
                type="number"
                name="total_amount"
                value={formData.total_amount || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="dueDate">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                name="due_date"
                value={formData.due_date || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="balance">
              <Form.Label>Balance</Form.Label>
              <Form.Control
                type="number"
                name="balance"
                value={formData.balance || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="serviceType">
              <Form.Label>Service Type</Form.Label>
              <Form.Control
                as="select"
                name="service_type"
                value={formData.service_type || ""}
                onChange={handleInputChange}
              >
                <option value="">Select Service Type</option>
                <option value="EXPORT OF SERVICES">EXPORT OF SERVICES</option>
                <option value="LOCAL SERVICE">LOCAL SERVICE</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreate}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="invoiceDate">
              <Form.Label>Invoice Date</Form.Label>
              <Form.Control
                type="date"
                name="invoice_date"
                value={formData.invoice_date || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="invoiceNumber">
              <Form.Label>Invoice Number</Form.Label>
              <Form.Control
                type="text"
                name="invoice_number"
                value={formData.invoice_number || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="customerName">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                name="customer_name"
                value={formData.customer_name || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="totalAmount">
              <Form.Label>Total Amount</Form.Label>
              <Form.Control
                type="number"
                name="total_amount"
                value={formData.total_amount || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="dueDate">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                name="due_date"
                value={formData.due_date || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="balance">
              <Form.Label>Balance</Form.Label>
              <Form.Control
                type="number"
                name="balance"
                value={formData.balance || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="serviceType">
              <Form.Label>Service Type</Form.Label>
              <Form.Control
                as="select"
                name="service_type"
                value={formData.service_type || ""}
                onChange={handleInputChange}
              >
                <option value="EXPORT OF SERVICES">EXPORT OF SERVICES</option>
                <option value="LOCAL SERVICE">LOCAL SERVICE</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AccountReceivable;
