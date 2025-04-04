# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# ChatSpace


//{
  "participants": ["userId1", "userId2"],
  "createdAt": "<serverTimestamp>",
  "lastMessage": {
    "text": "Hello there!",
    "createdAt": "<serverTimestamp>",
    "senderId": "userId1"
  },
  "unreadCount": {
    "userId1": 0,
    "userId2": 3
  },
  "readBy": ["userId1"]
}
{
  "senderId": "userId1",
  "senderName": "Alice",
  "photoUrl": "https://example.com/path-to-photo.jpg",
  "createdAt": "<serverTimestamp>",
  "text": "Hello!",
  "file": {
    "url": "https://example.com/path-to-file.jpg",
    "name": "image.jpg",
    "type": "image/jpeg"
  }
}
