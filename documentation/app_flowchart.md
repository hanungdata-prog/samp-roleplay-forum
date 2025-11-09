flowchart TD
  Start[Start] --> Landing[Landing Page]
  Landing --> SignIn[Sign In]
  Landing --> SignUp[Sign Up]
  SignIn --> AuthCheck{Authenticated?}
  SignUp --> AuthCheck{Authenticated?}
  AuthCheck -->|Yes| Dashboard[Dashboard]
  AuthCheck -->|No| Landing[Landing Page]
  Dashboard --> ForumHome[Forum Home]
  ForumHome --> CategoryView[Category View]
  CategoryView --> ThreadView[Thread View]
  ThreadView --> Reply[Post Reply]
  Dashboard --> Profile[User Profile]
  Dashboard --> AdminPanel[Admin Panel]
  AdminPanel --> ManageUsers[Manage Users]
  AdminPanel --> ManagePosts[Manage Posts]