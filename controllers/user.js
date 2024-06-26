const User = require("../models/user");
const { setUser } = require("../service/auth");
// const Semester = require("../models/semester");
const Subject = require("../models/subject");
async function handleUserSignup(req, res) {
  const { name, email, rollNo, password, semester, isAlumni } = req.body;

  try {
    if (!isAlumni) {
      // Find or create the semester
      const foundSubjects = await Subject.find({ semester: semester });
      if (!foundSubjects.length) {
        return res
          .status(404)
          .json({
            success: false,
            error: "No subjects found for the semester",
          });
      }

      // Create initial attendance records for each subject
      const attendance = foundSubjects.map((subject) => ({
        subject: subject._id,
        presentCount: 0,
        absentCount: 0,
        records: [],
      }));

      // Create the user with the provided details, semester, and attendance records
      const newUser = await User.create({
        name,
        email,
        rollNo,
        password,
        semester,
        subjects: foundSubjects.map((subject) => subject._id),
        attendance,
      });

      return res.redirect("/login");
    } else {
      // Create the alumni user without semester, subjects, and attendance
      const newUser = await User.create({
        name,
        email,
        rollNo,
        password,
        isAlumni: true,
      });

      return res.redirect("/login");
    }
  } catch (error) {
    console.error("Error signing up user:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
}

async function handleUserLogin(req, res) {
  const { email, rollNo, password } = req.body;

  const user = await User.findOne({ email, rollNo, password });

  // console.log("User found:", user);

  if (!user)
    return res.render("logsi", {
      error: "Invalid User",
    });

  const token = setUser(user);
  res.cookie("uid", token);
  return res.redirect("/");
}
async function logoutfunc(req, res) {
  res.cookie("uid", "", { maxAge: 1 });
  res.redirect("/login");
}
module.exports = {
  handleUserSignup,
  handleUserLogin,
  logoutfunc,
};
