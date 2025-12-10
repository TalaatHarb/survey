import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';

export default function Layout() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: 1,
            }}
          >
            {t('app.title')}
          </Typography>
          
          <Button
            color="inherit"
            component={RouterLink}
            to="/surveys"
            startIcon={<ListIcon />}
            sx={{
              mr: 1,
              bgcolor: location.pathname === '/surveys' ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            {t('nav.surveys')}
          </Button>
          
          <Button
            color="inherit"
            component={RouterLink}
            to="/editor"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: location.pathname.startsWith('/editor') ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            {t('nav.newSurvey')}
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
