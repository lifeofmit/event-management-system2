import React, { useEffect, useState } from 'react';
import { 
  Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem 
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import API from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'COORDINATOR' });

  const fetchUsers = async () => {
    try {
      const res = await API.getUsers();
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.createUser(formData);
      setOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'COORDINATOR' });
      fetchUsers(); // Refresh table
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  const roles = ['ADMIN', 'DEAN', 'COORDINATOR'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">User Management</Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setOpen(true)}>
          Add New User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Assigned Dean</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip label={u.role} size="small" color={u.role === 'ADMIN' ? 'error' : u.role === 'DEAN' ? 'secondary' : 'primary'} />
                </TableCell>
                <TableCell>{u.assignedDean?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Chip label={u.status ? 'Active' : 'Inactive'} size="small" color={u.status ? 'success' : 'default'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <TextField fullWidth margin="normal" label="Full Name" required 
              onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <TextField fullWidth margin="normal" type="email" label="Email Address" required 
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <TextField fullWidth margin="normal" type="password" label="Temporary Password" required 
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <TextField select fullWidth margin="normal" label="Role" value={formData.role} required 
              onChange={(e) => setFormData({...formData, role: e.target.value})}>
              {roles.map(role => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create User</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default UserManagement;