import pages from './pages';
import('./styles.css');
import profilePage from './profilePage';

const pageNames = ['login', 'main', 'profile'];

import mainPage from './mainPage';
import loginPage from './loginPage';

pages.openPage('login');
loginPage.handleEvents();
mainPage.handleEvents();

profilePage.handleEvents();