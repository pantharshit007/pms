<h1 align="center">PMS</h1>

A simple project management system built using ReactJS, NodeJS and MongoDB powered by TS.

## Technologies Used

### Backend

- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB
- **Validation:** Zod
- **Authentication:** JWT-based
- **File Uploads:** Multer + Cloudinary
- **Mailing:** Nodemailer + Mailgen

### Backend File Structure

```bash
├── public
│   └── uploads
│       ├── docs
│       ├── images
│       └── pdf
├── src
│   ├── index.ts
│   ├── controllers  # controllers
│   │   ├── auth.controller.ts
│   │   ├── note.controller.ts
│   │   ├── proj.controller.ts
│   │   ├── subTask.controller.ts
│   │   └── task.constroller.ts
│   ├── lib # libs
│   │   ├── db.ts
│   │   ├── delete-files.ts
│   │   ├── permit.ts
│   │   └── upload-files.ts
│   ├── middleware   # middlewares
│   │   ├── auth.middleware.ts
│   │   ├── err.middleware.ts
│   │   ├── multer.middleware.ts
│   │   ├── permit.middleware.ts
│   │   ├── proj-ctx.middleware.ts
│   │   └── ratelimit.middleware.ts
│   ├── models # models
│   │   ├── member.model.ts
│   │   ├── note.model.ts
│   │   ├── otp.model.ts
│   │   ├── project.model.ts
│   │   ├── subtask.model.ts
│   │   ├── task.model.ts
│   │   └── user.model.ts
│   ├── routes # routes
│   │   ├── root.route.ts  # root route
│   │   ├── auth.route.ts
│   │   ├── note.route.ts
│   │   ├── project.route.ts
│   │   ├── subTask.route.ts
│   │   └── task.route.ts
│   ├── templates # email: templates
│   │   └── otp-template.ts
│   ├── types  # types folder
│   │   ├── role.ts
│   │   ├── type.ts
│   │   └── types.d.ts
│   ├── utils  # utility functions
│   │   ├── api-response.ts
│   │   ├── constant.ts
│   │   ├── crypt.ts
│   │   ├── custom-error.ts
│   │   ├── env.ts
│   │   ├── otp-generate.ts
│   │   ├── send-mail.ts
│   │   └── try-catch.ts
│   └── validations  # validations: controller
│       ├── auth-schema.ts
│       ├── note-schema.ts
│       ├── project-schema.ts
│       ├── subTask-schema.ts
│       └── task-schema.ts
└── todo.md
```

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/)
- Cloudinary credentials (for file uploads)
- SMTP credentials (for email)

### Steps

1. Clone the repository:
   ```sh
   git clone https://github.com/pantharshit007/pms.git
   cd pms
   ```
2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Copy .env file:
   ```sh
   cp .env.example .env
   ```
4. update the .env file with your credentials

5. Start the server:
   ```sh
   pnpm dev
   ```

> [!NOTE]
> If you encounter any issues regarding transactions, replica sets checkout Readme in Backend folder [here](https://github.com/pantharshit007/pms/blob/main/backend/Readme.md)

> [!IMPORTANT]
> FRONTEND: The frontend is not yet started stay tuned.
