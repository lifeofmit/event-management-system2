import React, { useEffect, useState } from 'react';
import { 
  Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Switch, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField 
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import API from '../services/api';

const EventTypeManagement = () => {
  const [eventTypes, setEventTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [typeName, setTypeName] = useState('');

  const fetchTypes = async () => {
    try {
      const res = await API.getEventTypes();
      setEventTypes(res.data);
    } catch (error) {
      console.error("Failed to fetch types", error);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleOpenDialog = (type = null) => {
    if (type) {
      setEditMode(true);
      setCurrentId(type._id);
      setTypeName(type.name);
    } else {
      setEditMode(false);
      setCurrentId(null);
      setTypeName('');
    }
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.updateEventType(currentId, { name: typeName });
      } else {
        await API.createEventType({ name: typeName });
      }
      setOpen(false);
      fetchTypes();
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await API.updateEventType(id, { status: !currentStatus });
      fetchTypes();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event type?")) {
      try {
        await API.deleteEventType(id);
        fetchTypes();
      } catch (error) {
        alert("Cannot delete. It might be linked to existing events.");
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Event Type Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Category Name</strong></TableCell>
              <TableCell><strong>Active Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {eventTypes.map((type) => (
              <TableRow key={type._id}>
                <TableCell>{type.name}</TableCell>
                <TableCell>
                  <Switch 
                    checked={type.status} 
                    onChange={() => handleToggleStatus(type._id, type.status)} 
                    color="success"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpenDialog(type)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(type._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editMode ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus margin="dense" label="Event Category Name" type="text"
              fullWidth required variant="outlined" value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              placeholder="e.g., Workshop, Seminar, Cultural"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{editMode ? 'Save Changes' : 'Create'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default EventTypeManagement;