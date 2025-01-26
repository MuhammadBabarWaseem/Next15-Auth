import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    await dbConnect()

    const { name, email, password } = await req.json()

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    return NextResponse.json(
      { message: "User created successfully", user: { id: user._id, name: user.name, email: user.email } },
      { status: 201 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "An error occurred while registering the user" }, { status: 500 })
  }
}

