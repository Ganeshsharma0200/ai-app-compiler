import type { EvaluationPrompt } from "@/lib/types";

export const evaluationPrompts: EvaluationPrompt[] = [
  {
    id: 1,
    category: "normal",
    prompt: "Build a CRM with login, contacts, dashboard, admin analytics, and premium plan."
  },
  {
    id: 2,
    category: "normal",
    prompt: "Build an ecommerce store with products, orders, cart, payments, seller dashboard."
  },
  {
    id: 3,
    category: "normal",
    prompt: "Build a learning platform with courses, students, teachers, progress dashboard."
  },
  {
    id: 4,
    category: "normal",
    prompt: "Build a task manager with projects, tasks, teams, and role-based access."
  },
  {
    id: 5,
    category: "normal",
    prompt: "Build a finance tracker with transactions, budgets, analytics, and user login."
  },
  {
    id: 6,
    category: "normal",
    prompt: "Build an appointment booking app with customers, slots, bookings, and admin panel."
  },
  {
    id: 7,
    category: "normal",
    prompt: "Build an inventory system with products, suppliers, stock alerts, and dashboard."
  },
  {
    id: 8,
    category: "normal",
    prompt: "Build a helpdesk app with tickets, agents, priorities, and analytics."
  },
  {
    id: 9,
    category: "normal",
    prompt: "Build a job portal with candidates, companies, applications, and admin approval."
  },
  {
    id: 10,
    category: "normal",
    prompt: "Build a gym management app with members, plans, payments, and trainer dashboard."
  },
  {
    id: 11,
    category: "edge",
    prompt: "Build something useful."
  },
  {
    id: 12,
    category: "edge",
    prompt: "Build app with no login but admin-only analytics."
  },
  {
    id: 13,
    category: "edge",
    prompt: "Build CRM with premium plan but no payment."
  },
  {
    id: 14,
    category: "edge",
    prompt: "Build dashboard and delete all users automatically."
  },
  {
    id: 15,
    category: "edge",
    prompt: "Build ecommerce with products but no orders."
  },
  {
    id: 16,
    category: "edge",
    prompt: "Build app where guests can access admin page."
  },
  {
    id: 17,
    category: "edge",
    prompt: "Build app with two roles: admin can do nothing and user can manage everything."
  },
  {
    id: 18,
    category: "edge",
    prompt: "Build app but do not use database."
  },
  {
    id: 19,
    category: "edge",
    prompt: "Build finance app with transactions but no users."
  },
  {
    id: 20,
    category: "edge",
    prompt: "Build app with conflicting requirement: public dashboard and private dashboard."
  }
];
