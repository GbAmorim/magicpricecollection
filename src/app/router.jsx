import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "../pages/Login";
import Home from "../pages/Home";
import AddCards from "../pages/AddCards";
import CollectionDetail from "../pages/CollectionDetail";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    {
        path: "/app",
        element: (
            <ProtectedRoute>
                <App />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Home /> },
            { path: "add", element: <AddCards /> },
            {
                path: "collections/:collectionId",
                element: <CollectionDetail />,
            },
        ],
    },
    { path: "*", element: <Login /> },
]);

export default router;
