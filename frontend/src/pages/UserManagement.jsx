import React, { useEffect, useState, useContext } from 'react';
import { 
  Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, IconButton, Tooltip, Grid, Card, CardContent
} from '@mui/material';
import { PersonAdd, Edit, AccountCircle } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const UserManagement = () => {
  const { user: currentUser, login } = useContext(AuthContext); // Access authenticated active user data
  const [users, setUsers] = useState([]);
  
  // Dialog visibility states
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openSelf, setOpenSelf] = useState(false);

  // Form Fields State management
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'COORDINATOR' });
  const [editForm, setEditForm] = useState({ id: '', name: '', email: '', password: '', role: '', assignedDean: '' });
  const [selfForm, setSelfForm] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', password: '' });

  const fetchUsers = async () => {
    try {
      const res = await API.getUsers();
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch user directory index", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter lists out for mapping selection values
  const deanList = users.filter(u => u.role === 'DEAN');
  const systemRoles = ['ADMIN', 'DEAN', 'COORDINATOR'];

  // Handle addition of a new user account
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.createUser(createForm);
      setOpenCreate(false);
      setCreateForm({ name: '', email: '', password: '', role: 'COORDINATOR' });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to register account');
    }
  };

  // Pre-populate fields when editing a user
  const handleOpenEditDialog = (targetUser) => {
    setEditForm({
      id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      assignedDean: targetUser.assignedDean?._id || '',
      password: '' // Leave blank initially by default security guidelines
    });
    setOpenEdit(true);
  };

  // Submit alterations for a selected user account
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.updateUser(editForm.id, editForm);
      setOpenEdit(false);
      fetchUsers();
      alert("User configuration synchronized successfully!");
    } catch (error) {
      alert(error.response?.data?.message || 'Update processing failed');
    }
  };

  // Submit changes for Super Admin's personal profile card
  const handleSelfSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.updateUser(currentUser.id, selfForm);
      setOpenSelf(false);
      setSelfForm(prev => ({ ...prev, password: '' }));
      alert("Your profile configurations have updated successfully! Please note changes on next system access session.");
      window.location.reload(); // Refresh session layout context safely
    } catch (error) {
      alert(error.response?.data?.message || 'Self profile update process failed');
    }
  };

  return (
    <Box>
      {/* --- Section A: Super Admin Profile Action Header --- */}
      <Card sx={{ mb: 4, backgroundColor: '#e3f2fd' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={2}>
            {/* <AccountCircle color="primary" sx={{ fontSize: 40 }} /> */}
            <Box>
              <Typography variant="h6">{currentUser?.name} (You)</Typography>
              <Typography variant="body2" color="textSecondary">{currentUser?.email} | Role: Super Admin</Typography>
            </Box>
          </Box>
          <Button variant="outlined" color="primary" onClick={() => setOpenSelf(true)}>
            Edit My Credentials
          </Button>
        </CardContent>
      </Card>

      {/* --- Section B: Main User Management Layout Controls --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">System User Directory</Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setOpenCreate(true)}>
          Add New User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>System Role</strong></TableCell>
              <TableCell><strong>Assigned Dean Scope</strong></TableCell>
              <TableCell align="right"><strong>Management Control Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No manageable users exist inside the system registry scope yet.</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u._id} hover>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={u.role} 
                      size="small" 
                      color={u.role === 'ADMIN' ? 'error' : u.role === 'DEAN' ? 'secondary' : 'primary'} 
                    />
                  </TableCell>
                  <TableCell>{u.assignedDean?.name || <Typography variant="caption" color="textSecondary">None Assigned</Typography>}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Profile Configs & Access Rules">
                      <IconButton color="primary" onClick={() => handleOpenEditDialog(u)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- Dialog 1: Add User Modal --- */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Account</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent>
            <TextField fullWidth margin="normal" label="Full Name" required 
              value={createForm.name} onChange={(e) => setCreateForm({...createForm, name: e.target.value})} />
            <TextField fullWidth margin="normal" type="email" label="Email Address" required 
              value={createForm.email} onChange={(e) => setCreateForm({...createForm, email: e.target.value})} />
            <TextField fullWidth margin="normal" type="password" label="Temporary Access Password" required 
              value={createForm.password} onChange={(e) => setCreateForm({...createForm, password: e.target.value})} />
            <TextField select fullWidth margin="normal" label="Role Assignment" value={createForm.role} required 
              onChange={(e) => setCreateForm({...createForm, role: e.target.value})}>
              {systemRoles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* --- Dialog 2: Edit Existing User Modal (Includes Reassign Dean integration) --- */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modify User Profile Settings</DialogTitle>
        <Box component="form" onSubmit={handleEditSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item size={{xs:12, md:6}}>
                <TextField fullWidth label="Full Name" required 
                  value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
              </Grid>
              <Grid item  size={{xs:12, md:6}}>
                <TextField fullWidth type="email" label="Email Address" required 
                  value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
              </Grid>
              <Grid item size={{xs:12, md:6}}>
                <TextField select fullWidth label="Role Class Assignment" value={editForm.role} required 
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}>
                  {systemRoles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                </TextField>
              </Grid>

              {/* DYNAMIC COMPONENT: Shows Dean assignment input row instantly if user role context equates to Coordinator */}
              {editForm.role === 'COORDINATOR' && (
                <Grid item  size={{xs:12, md:6}}>
                  <TextField 
                    select fullWidth label="Assign/Reassign Overseeing Dean" 
                    value={editForm.assignedDean} 
                    onChange={(e) => setEditForm({...editForm, assignedDean: e.target.value})}
                  >
                    <MenuItem value=""><em>None (Clear Assigned Dean Context)</em></MenuItem>
                    {deanList.map(dean => <MenuItem key={dean._id} value={dean._id}>{dean.name}</MenuItem>)}
                  </TextField>
                </Grid>
              )}

              <Grid item size={{xs:12}}>
                <TextField 
                  fullWidth type="text" label="Override Security Password (Leave blank to keep current)" 
                  value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} 
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancel Registration</Button>
            <Button type="submit" variant="contained" color="primary">Save Synchronization Updates</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* --- Dialog 3: Super Admin Profile Self-Update Modal --- */}
      <Dialog open={openSelf} onClose={() => setOpenSelf(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update My Security Credentials</DialogTitle>
        <Box component="form" onSubmit={handleSelfSubmit}>
          <DialogContent>
            <TextField fullWidth margin="normal" label="My Account Public Name" required 
              value={selfForm.name} onChange={(e) => setSelfForm({...selfForm, name: e.target.value})} />
            <TextField fullWidth margin="normal" type="email" label="My Authorized Email Sign-in Root" required 
              value={selfForm.email} onChange={(e) => setSelfForm({...selfForm, email: e.target.value})} />
            <TextField 
              fullWidth margin="normal" type="text" label="Change Password (Leave blank to preserve current)" 
              value={selfForm.password} onChange={(e) => setSelfForm({...selfForm, password: e.target.value})} 
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSelf(false)}>Dismiss</Button>
            <Button type="submit" variant="contained" color="success">Commit Credential Update</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default UserManagement;