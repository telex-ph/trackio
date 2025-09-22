import React from 'react'

const StatCard = ({ title, value, icon, subtitle }) => {
    return (
        <div className="bg-white border-light p-4 flex items-center justify-between rounded-md">
            <div>
                <div className="text-4xl! font-bold">{value}</div>
                <div className="flex items-center mb-2">
                    <div className="flex-1 flex flex-col">
                        <span className="text-sm">{title}</span>
                        <span className="text-xs text-light">{subtitle}</span>
                    </div>
                </div>
            </div>
            <div>{icon}</div>
        </div>
    )
}

export default StatCard