# Barber Booking Web App

A full-stack barber booking platform for barbers and customers, featuring OTP-based authentication, shop and service management, live queue system, and modern React UI.

## Tech Stack
- **Backend:** Node.js, Express.js, MongoDB, JWT, Nodemailer, Cloudinary
- **Frontend:** React.js, Axios, Context API, CSS

## Features
- Email OTP signup (no password at signup)
- Barber and customer roles in a unified user schema
- Barber: register shop, manage services, live queue
- Customer: browse barbers, view services, join queue
- Cloudinary image uploads
- JWT authentication
- Modern, responsive UI

## Folder Structure
```
barbar/
  server/         # Express backend
    models/       # Mongoose models
    controllers/  # Route controllers
    routes/       # Express routes
    middlewares/  # Auth, validation
    utils/        # Mail, OTP, Cloudinary
    config/       # DB, Cloudinary config
    index.js      # App entry
    .env          # Environment variables
  src/            # React frontend
    components/   # UI components
    pages/        # Route pages
    context/      # Auth context
    api/          # Axios instance
    App.js        # Main app
    App.css       # Styles
```

## Environment Variables
Create a `.env` file in `server/` with:
```
MONGO_URI=your_mongodb_url
JWT_SECRET=your_jwt_secret
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_gmail_user
MAIL_PASS=your_gmail_app_password
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

For frontend, create `.env` in root (optional):
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Setup & Run
### Backend
```
cd server
npm install
npm run dev
```

### Frontend
```
npm install
npm start
```

## Deployment
- Frontend: Vercel
- Backend: Render or Vercel (Express API)

## License
MIT
