import { lazy } from "react";

// static page which dont need to be async loaded
import PublicLayout from "./layouts/PublicLayout";
import Error from "./pages/404";

// async loading page for better performance
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Logout = lazy(() => import("./pages/Logout"));
const Register = lazy(() => import("./pages/Register"));
const User = lazy(() => import("./pages/User"));

// common routes
const publicRoutes = [
    {
        path: '',
        element: <PublicLayout />,
        children: [
            {
                path: '',
                element: <Home />
            },
            {
                path: 'connexion',
                element: <Login />
            },
            {
                path: 'inscription',
                element: <Register />
            }
        ]
    },
    {
        path: '*',
        element: <Error />
    }
];

const privateRoutes = () => {
    let publicRef = [...publicRoutes];
    const privates = [
        {
            path: 'profile',
            element: <User />,
            children: []
        },
        {
            path: 'deconnexion',
            element: <Logout />
        }
    ];

    for (const child in publicRef[0].children) {
        if (publicRef[0].children[child].path === 'connexion' || publicRef[0].children[child].path === 'inscription') {
            publicRef[0].children.splice(child, 1);
        }    
    }

    publicRef[0].children.push(...privates);

    return publicRef;
}

export {
    publicRoutes, 
    privateRoutes
}