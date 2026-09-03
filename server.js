require('dotenv').config();
const express = require('express');
const app = express();
app.set('trust proxy', 1);

const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const corsOptions = require('./config/corsOptions');
const errorHandler = require('./middleware/errorHandler');
const credentials = require('./middleware/credentials');
const verifyJwt = require('./middleware/verifyJwt');
const connectDB = require('./config/db');
const projectRoutes = require("./routes/projectRoutes");
const mileStoneRoutes = require('./routes/milestoneRoutes');
const taskRoutes = require("./routes/taskRoutes");
const invitationRoutes = require("./routes/invitationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const PORT = process.env.PORT || 3500;

connectDB();

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());

app.use((req, res, next) => {
    console.log("Incoming Request:");
    console.log(req.method, req.url);
    next();
});

app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
app.use('/projects', projectRoutes);
app.use('/invitations', invitationRoutes);

app.use(verifyJwt);

app.use('/projects', projectRoutes);
app.use('/milestones', mileStoneRoutes)
app.use("/", taskRoutes);
app.use("/ai", aiRoutes);
app.use("/analytics", analyticsRoutes);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on the port ${PORT}`));
});

//console.log(app);

