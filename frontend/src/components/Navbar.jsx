import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <div>
            <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 cursor-pointer">
                    {/* Logo & Name */}
                    <div className="flex items-center gap-2">
                        <Link to="/">
                            <img
                                src="/src/assets/Screenshot 2025-10-01 123117-Photoroom 1.png" // Path to logo
                                alt="Thesis.io Logo"
                                className="h-[68px] w-[240px]" // Use h-[...] and w-[...] for custom sizes
                            />
                        </Link>

                    </div>

                    {/* Profile Icon */}
                    <div>
                        <div className="h-9 w-9 rounded-full bg-black flex items-center justify-center cursor-pointer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5.121 17.804A9.005 9.005 0 0112 15c1.936 0 3.725.613 5.121 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Navbar
