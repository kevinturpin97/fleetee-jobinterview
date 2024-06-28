// FEATURE: add site_name & api_url to process.env file
const site_name = "Où en étais-je ?";
const api_url = 'http://localhost:8000';

// FEATURE: translate ALL errors messages
const errorTypes = {
    'register': [
        {
            'message': 'No data provided',
            'translation': 'Aucune donnée fournie'
        },
        {
            'message': 'Invalid email address',
            'translation': 'Adresse e-mail invalide'
        },
        {
            'message': 'Password must be at least 8 characters long',
            'translation': 'Le mot de passe doit comporter au moins 8 caractères'
        },
        {
            'message': 'Passwords do not match',
            'translation': 'Les mots de passe ne correspondent pas'
        },
        {
            'message': 'Email address already in use',
            'translation': 'Adresse e-mail déjà utilisée'
        },
        {
            'message': 'Email and password are required',
            'translation': 'Adresse e-mail et mot de passe requis'
        }
    ],
    'login': [
        {
            'message': 'Invalid credentials.',
            'translation': 'Mot de passe ou adresse e-mail incorrecte'
        },
        {
            'message': 'Authentication failed',
            'translation': 'Mot de passe ou adresse e-mail incorrecte'
        }
    ],
    'default': {
        'message': 'Something went wrong',
        'translation': 'Une erreur est survenue et a été remontée à l\'équipe technique'
    }
};

export {
    api_url,
    errorTypes,
    site_name
}