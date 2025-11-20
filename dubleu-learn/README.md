# DubleuLearn - E-Learning Platform

![DubleuLearn](https://img.shields.io/badge/DubleuLearn-E--Learning%20Platform-blue)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📚 Project Description

DubleuLearn is a comprehensive MERN stack e-learning platform designed to facilitate seamless online education. The platform enables teachers to create and manage courses, while students can enroll, complete assignments, and track their progress. Built with modern web technologies, DubleuLearn provides an intuitive and responsive user experience for both educators and learners.

### 🎯 Key Features

- **Multi-role Authentication** (Student, Teacher)
- **Course Management System**
- **Assignment Submission & Grading**
- **Real-time Progress Tracking**
- **Responsive Design**
- **Secure File Uploads**
- **Interactive User Interface**

## 🏗️ Technology Stack

### Frontend
- **React.js** - Component-based UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Styling and animations
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 🚀 Live Deployment

🌐 **Live Application**: [https://dubleulearn.vercel.app](https://dubleulearn.vercel.app) *(Replace with your actual deployment URL)*

🎥 **Video Demonstration**: [Watch Demo Video](https://youtu.be/your-demo-video) *(Replace with your actual video link)*

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/3498db/ffffff?text=Dashboard+Overview)
*Personalized dashboard showing enrolled courses and upcoming assignments*

### Course Management
![Course Management](https://via.placeholder.com/800x400/2ecc71/ffffff?text=Course+Management)
*Teachers can create and manage courses with rich content*

### Assignment Submission
![Assignment Submission](https://via.placeholder.com/800x400/e74c3c/ffffff?text=Assignment+Submission)
*Students can submit assignments with text and file uploads*

### Grading Interface
![Grading Interface](https://via.placeholder.com/800x400/f39c12/ffffff?text=Grading+Interface)
*Teachers can grade submissions and provide feedback*

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/PLP-MERN-Stack-Development/mern-final-project-Dubleu-x.git
   cd dubleulearn
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   
   # Update .env with your configurations
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   
   # Update .env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Run the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🗂️ Project Structure

```
dubleulearn/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Assignment.js
│   │   └── Submission.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   └── assignments.js
│   ├── middleware/
│   │   └── auth.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.js
│   └── public/
└── README.md
```

## 👥 User Roles & Permissions

### Student
- Browse and enroll in courses
- Submit assignments
- View grades and feedback
- Track learning progress

### Teacher
- Create and manage courses
- Create assignments and lessons
- Grade student submissions
- Monitor student progress

### Admin
- Manage all users and courses
- System-wide analytics
- Platform configuration

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course

### Assignments
- `POST /api/assignments/:id/submit` - Submit assignment
- `GET /api/assignments/:id/submissions` - Get submissions
- `PUT /api/assignments/submissions/:id/grade` - Grade submission

## 🎨 Features in Detail

### Course Creation
- Rich text syllabus and descriptions
- Learning objectives
- Course duration and scheduling
- Multimedia content support

### Assignment System
- Multiple submission types (text, files)
- Due date management
- Grading rubrics
- Feedback system

### User Experience
- Responsive design for all devices
- Real-time notifications
- Progress tracking
- Intuitive navigation

## 🚧 Future Enhancements

- [ ] Real-time chat and discussions
- [ ] Video conferencing integration
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Payment integration for premium courses
- [ ] AI-powered recommendations

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Sylvester Kamau**
- GitHub: [@yourusername](https://github.com/Dubleu-x)
- LinkedIn: [Your LinkedIn](www.linkedin.com/in/sylvester-kamau-b7a714351)
- Email: clvesta321@gmail.com

## 🙏 Acknowledgments

- React.js community for excellent documentation
- MongoDB for robust database solutions
- All contributors and testers
- PLP Academy for guidance and support

---
