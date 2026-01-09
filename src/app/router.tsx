import { createBrowserRouter } from 'react-router-dom';
import { Home } from '../pages/Home';
import { CreateMeeting } from '../pages/CreateMeeting';
import { MeetingPage } from '../pages/Meeting';

export const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/create', element: <CreateMeeting /> },
    { path: '/m/:id', element: <MeetingPage /> },
]);
