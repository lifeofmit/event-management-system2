import React, { useContext, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Button
} from '@mui/material';
import { Menu, Dashboard, Event, AddBox, ExitToApp, Group } from '@mui/icons-material';

const drawerWidth = 240;

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/', roles: ['SUPER_ADMIN', 'ADMIN', 'DEAN', 'COORDINATOR'] },
    { text: 'Events', icon: <Event />, path: '/events', roles: ['SUPER_ADMIN', 'ADMIN', 'DEAN', 'COORDINATOR'] },
    { text: 'Add Event', icon: <AddBox />, path: '/add-event', roles: ['SUPER_ADMIN', 'ADMIN', 'DEAN', 'COORDINATOR'] },
    { text: 'User Management', icon: <Group />, path: '/users', roles: ['SUPER_ADMIN'] },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>Event System</Typography>
      </Toolbar>
      <List>
        {menuItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <Menu />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {user?.role.replace('_', ' ')} Portal
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>{user?.name}</Typography>
          <Button color="inherit" onClick={logout} startIcon={<ExitToApp />}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar /> {/* Spacer for AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;