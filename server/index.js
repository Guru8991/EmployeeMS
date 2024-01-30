import express from "express";
import cors from "cors";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from "path";

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://localhost:27017/EMS', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Define Mongoose Schema for employee
const employeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    address: String,
    salary: Number
});

const Employee = mongoose.model('Employee', employeeSchema);

// Define Mongoose Schema for users
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.get('/getEmployee', async (req, res) => {
    try {
        const employees = await Employee.find();
        return res.json({ Status: "Success", Result: employees });
    } catch (err) {
        return res.json({ Error: "Get employee error in MongoDB" });
    }
});

app.get('/get/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.json({ Error: "Employee not found" });
        }
        return res.json({ Status: "Success", Result: employee });
    } catch (err) {
        return res.json({ Error: "Get employee error in MongoDB" });
    }
});

app.put("/update/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedEmployee = {
            name: req.body.name,
            email: req.body.email,
            salary: req.body.salary,
            address: req.body.address
        };
        await Employee.findByIdAndUpdate(userId, updatedEmployee);
        return res.json({ Status: "Success" });
    } catch (err) {
        return res.json({ Error: "Update employee error in MongoDB" });
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await Employee.findByIdAndDelete(id);
        return res.json({ Status: "Success" });
    } catch (err) {
        return res.json({ Error: "Delete employee error in MongoDB" });
    }
});

app.get('/adminCount', async (req, res) => {
    try {
        const count = await User.countDocuments();
        return res.json({ admin: count });
    } catch (err) {
        return res.json({ Error: "Error in running query" });
    }
});

app.get('/employeeCount', async (req, res) => {
    try {
        const count = await Employee.countDocuments();
        return res.json({ employee: count });
    } catch (err) {
        return res.json({ Error: "Error in running query" });
    }
});

app.get('/salary', async (req, res) => {
    try {
        const sum = await Employee.aggregate([{ $group: { _id: null, sumOfSalary: { $sum: "$salary" } } }]);
        return res.json(sum);
    } catch (err) {
        return res.json({ Error: "Error in running query" });
    }
});

app.post('/create', async (req, res) => {
    try {
        const { name, email, address, salary } = req.body;
        const newEmployee = new Employee({ name, email, address, salary });
        await newEmployee.save();
        return res.json({ Status: "Success", Result: newEmployee });
    } catch (err) {
        return res.json({ Error: "Error creating employee" });
    }
});

app.get('/hash', (req, res) => {
    bcrypt.hash("123456", 10, (err, hash) => {
        if (err) return res.json({ Error: "Error in hashing password" });
        return res.json({ result: hash });
    });
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ Status: "Error", Error: "Wrong Email or Password" });
        }
        bcrypt.compare(password.toString(), user.password, (err, result) => {
            if (err) return res.json({ Error: "Password error" });
            if (result) {
                const token = jwt.sign({ role: "admin" }, "jwt-secret-key", { expiresIn: '1d' });
                return res.json({ Status: "Success", Token: token });
            } else {
                return res.json({ Status: "Error", Error: "Wrong Email or Password" });
            }
        });
    } catch (err) {
        return res.json({ Status: "Error", Error: "Error in running query" });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password.toString(), 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        return res.json({ Status: "Success" });
    } catch (err) {
        return res.json({ Error: "Error creating user" });
    }
});


// Always serve static files
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../client/dist')));

// Always handle all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
