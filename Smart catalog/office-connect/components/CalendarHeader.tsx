'use client';

interface CalendarHeaderProps {
    currentMonth: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
    viewMode: 'calendar' | 'list';
    onViewChange: (mode: 'calendar' | 'list') => void;
}

export default function CalendarHeader({
    currentMonth,
    onPrevMonth,
    onNextMonth,
    onToday,
    viewMode,
    onViewChange,
}: CalendarHeaderProps) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const month = monthNames[currentMonth.getMonth()];
    const year = currentMonth.getFullYear();

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
            }}
        >
            {/* Left: Month/Year and Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                    {month} {year}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={onPrevMonth}
                        className="btn"
                        style={{ background: '#eee', padding: '0.5rem 0.75rem' }}
                    >
                        ‹
                    </button>
                    <button
                        onClick={onToday}
                        className="btn"
                        style={{ background: '#eee', padding: '0.5rem 1rem' }}
                    >
                        Today
                    </button>
                    <button
                        onClick={onNextMonth}
                        className="btn"
                        style={{ background: '#eee', padding: '0.5rem 0.75rem' }}
                    >
                        ›
                    </button>
                </div>
            </div>

            {/* Right: View Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => onViewChange('calendar')}
                    className="btn"
                    style={{
                        background: viewMode === 'calendar' ? '#2196F3' : '#eee',
                        color: viewMode === 'calendar' ? 'white' : '#333',
                        padding: '0.5rem 1rem',
                    }}
                >
                    📅 Calendar
                </button>
                <button
                    onClick={() => onViewChange('list')}
                    className="btn"
                    style={{
                        background: viewMode === 'list' ? '#2196F3' : '#eee',
                        color: viewMode === 'list' ? 'white' : '#333',
                        padding: '0.5rem 1rem',
                    }}
                >
                    📋 List
                </button>
            </div>
        </div>
    );
}
