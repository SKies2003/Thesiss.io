import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
    return (
        <div style={{ backgroundColor: '#2C2C2C' }}>
            <div className="flex flex-col md:flex-row items-center justify-center min-h-screen p-8">
                {/* Replace src below with your actual image path */}
                <img
                    src="/src/assets/image-removebg-preview (1) 1 (1).png"
                    alt="Growth Chart"
                    className="w-106 md:w-[32rem] mb-8 md:mb-0 md:mr-14"
                />
                <div className="max-w-lg">
                    <h2 className="text-white text-3xl mb-2">
                        Grow your Fortune with Event-Driven Compounding Analysis
                    </h2>
                    <p className="text-gray-300 mb-6 py-5.5">
                        Thesis.io is a specialized platform for individual investors to see how major company milestones correlate
                        with financial performance, helping you build conviction for long-term wealth creation.
                    </p>
                    <div className="flex gap-4">
                        <Link to={"/wealth-journey"}><button
                            style={{ backgroundColor: '#52B0C3' }}
                            className="text-white px-6 py-2 md:px-10 md:py-3 lg:px-13 lg:py-16 rounded-lg font-semibold cursor-pointer"
                        >
                            Analyze the History
                        </button>
                        </Link>
                        <Link to={"/wealth-projector"}>
                        <button
                            style={{ backgroundColor: '#EA4335' }}
                            className="text-white px-6 py-2 md:px-10 md:py-3 lg:px-13 lg:py-16 rounded-lg font-semibold cursor-pointer"
                        >
                            Project Your Wealth
                        </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage
