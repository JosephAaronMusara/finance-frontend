import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchExpenses, fetchBankBalances } from "../features/dataSlice";
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

const Expenses = () => {
  const [data, setData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // Read-only modal state
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const expenses = useSelector((state) => state.data.expenses);

  const handleFetchProjects = useCallback(() => {
    dispatch(fetchExpenses());
    dispatch(fetchBankBalances());
  }, [dispatch]);

  useEffect(() => {
    handleFetchProjects();
  }, [handleFetchProjects]);

  const handleCloseEdit = () => setShowEditModal(false);
  const handleShowEdit = (row) => {
    setFormData(row);
    setShowEditModal(true);
  };

  const handleCloseCreate = () => {
    setFormData({});
    setShowCreateModal(false);
  };

  const handleShowCreate = () => setShowCreateModal(true);

  const handleCloseDetails = () => setShowDetailsModal(false);
  const handleShowDetails = (row) => {
    setFormData(row);
    setShowDetailsModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async () => {
    try {
      await axios.post("/expense/", formData);
      setShowCreateModal(false);
      handleFetchProjects();
    } catch (error) {
      console.error("Error creating data:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`expense/${formData.id}/`, formData);
      setShowEditModal(false);
      handleFetchProjects();
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`expense/${id}/`);
        handleFetchProjects();
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  const filteredData = expenses.filter((row) =>
    row.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
u
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
            <Nav.Link onClick={() => navigate("/bankbalance")}>
              <i className="bi bi-bank me-2"></i> Bank Balances
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/account-receivables")}>
              <i className="bi bi-graph-up-arrow"></i>Account Receivables
            </Nav.Link>
            <Nav.Link className="nav-link" onClick={() => navigate("/rates")}>
              <i className="bi bi-pencil-square"></i> Rates
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className="container mt-4">
        <h2 className="text-center mb-4">Expenses</h2>

        <Form.Control
          type="text"
          placeholder="Search by Description..."
          className="mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              {/* <th>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row) => (
              <tr key={row.id} onClick={() => handleShowDetails(row)}>
                <td>{row.description}</td>
                <td>{row.amount}</td>
                {/* <td>
                  <Button variant="warning" onClick={(e) => { e.stopPropagation(); handleShowEdit(row); }}>Edit</Button>
                  <Button variant="danger" className="ms-2" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>Delete</Button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </Table>

        <Pagination className="justify-content-center">
          <Pagination.Prev
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>

        {/* Details Modal */}
        <Modal show={showDetailsModal} onHide={handleCloseDetails}>
          <Modal.Header closeButton>
            <Modal.Title>Expense Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Description:</strong> {formData.description}
            </p>
            <p>
              <strong>Amount:</strong> {formData.amount}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="warning"
              onClick={() => {
                handleCloseDetails();
                handleShowEdit(formData);
              }}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                handleCloseDetails();
                handleDelete(formData.id);
              }}
            >
              Delete
            </Button>
            <Button variant="secondary" onClick={handleCloseDetails}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Modal */}
        <Modal show={showEditModal} onHide={handleCloseEdit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Expense</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formAmount" className="mt-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="text"
                  name="amount"
                  value={formData.amount || ""}
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
            <Modal.Title>Add New Expense</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formAmount" className="mt-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="text"
                  name="amount"
                  value={formData.amount || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCreate}>
              Close
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Add Expense
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Expenses;
