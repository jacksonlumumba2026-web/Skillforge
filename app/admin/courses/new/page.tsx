import CourseForm from "../CourseForm";

export default function NewCoursePage() {
  return (
    <div className="container-page py-16 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">New course</h1>
      <CourseForm />
    </div>
  );
}
