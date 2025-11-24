'use client';

import Link from 'next/link';
import { useState } from 'react';

interface CalendarEvent {
    id: string;
    startTime: string;
    endTime: string;
    location: string;
    activityType: {
        id: string;
        name: string;
    };
    host: {
        username: string;
    };
}

interface CalendarViewProps {
    events: CalendarEvent[];
    currentMonth: Date;
    onEventClick?: (eventId: string) => void;
}

export default function CalendarView({ events, currentMonth, onEventClick }: CalendarViewProps) {
    // Track both eventId and date to show tooltip only at hovered cell
    const [hoveredEvent, setHoveredEvent] = useState<{ id: string; date: string } | null>(null);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const startDayOfWeek = firstDay.getDay();
    const adjustedStart = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: adjustedStart }, (_, i) => prevMonthLastDay - adjustedStart + i + 1);

    const totalCells = 42;
    const nextMonthDays = totalCells - adjustedStart - daysInMonth;

    const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getActivityColor = (activityName: string) => {
        const colors: Record<string, string> = {
            'Football': '#4CAF50',
            'Basketball': '#FF9800',
            'Badminton': '#2196F3',
            'Swimming': '#00BCD4',
            'Yoga': '#9C27B0',
            'Bóng đá': '#4CAF50',
        };
        return colors[activityName] || '#757575';
    };

    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            return eventStart <= dayEnd && eventEnd >= dayStart;
        });
    };

    const isMultiDay = (event: CalendarEvent) => {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        return start.toDateString() !== end.toDateString();
    };

    const renderDayCell = (day: number, isCurrentMonth: boolean, dateObj: Date) => {
        const isToday = dateObj.toDateString() === new Date().toDateString();
        const dayEvents = getEventsForDate(dateObj);
        const dateKey = dateObj.toISOString();

        return (
            <div
                key={dateKey}
                style={{
                    border: '1px solid #e0e0e0',
                    minHeight: '100px',
                    padding: '0.25rem',
                    background: isCurrentMonth ? 'white' : '#f5f5f5',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: isCurrentMonth ? (isToday ? '#2196F3' : '#333') : '#999',
                        fontSize: '0.875rem',
                        marginBottom: '0.25rem',
                    }}
                >
                    {day}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {dayEvents.slice(0, 3).map((event) => {
                        const showTooltip = hoveredEvent?.id === event.id && hoveredEvent?.date === dateKey;

                        return (
                            <div
                                key={event.id}
                                style={{ position: 'relative' }}
                                onMouseEnter={() => setHoveredEvent({ id: event.id, date: dateKey })}
                                onMouseLeave={() => setHoveredEvent(null)}
                            >
                                <Link
                                    href={`/events/view/${event.id}`}
                                    style={{
                                        background: getActivityColor(event.activityType.name),
                                        color: 'white',
                                        padding: '2px 4px',
                                        fontSize: '0.75rem',
                                        borderRadius: '3px',
                                        textDecoration: 'none',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'block',
                                    }}
                                    onClick={(e) => {
                                        if (onEventClick) {
                                            e.preventDefault();
                                            onEventClick(event.id);
                                        }
                                    }}
                                >
                                    {new Date(event.startTime).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    })} {event.activityType.name}
                                </Link>

                                {showTooltip && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: '0',
                                            zIndex: 1000,
                                            background: 'white',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            padding: '0.75rem',
                                            minWidth: '250px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            marginTop: '4px',
                                        }}
                                    >
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <strong style={{
                                                color: getActivityColor(event.activityType.name),
                                                fontSize: '1rem',
                                                display: 'block',
                                                marginBottom: '0.25rem',
                                            }}>
                                                {event.activityType.name}
                                            </strong>
                                            <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                                🕐 {new Date(event.startTime).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                                {isMultiDay(event) && (
                                                    <span> - {new Date(event.endTime).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ fontSize: '0.875rem', color: '#333', marginBottom: '0.5rem' }}>
                                            📍 {event.location}
                                        </div>

                                        <div style={{
                                            fontSize: '0.875rem',
                                            color: '#666',
                                            paddingTop: '0.5rem',
                                            borderTop: '1px solid #eee',
                                        }}>
                                            🙋 Host: <strong>{event.host.username}</strong>
                                        </div>

                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#999',
                                            marginTop: '0.25rem',
                                        }}>
                                            Click to view details
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {dayEvents.length > 3 && (
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                            +{dayEvents.length - 3} more
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const calendarDays = [];

    prevMonthDays.forEach((day) => {
        const date = new Date(year, month - 1, day);
        calendarDays.push(renderDayCell(day, false, date));
    });

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        calendarDays.push(renderDayCell(day, true, date));
    }

    for (let day = 1; day <= nextMonthDays; day++) {
        const date = new Date(year, month + 1, day);
        calendarDays.push(renderDayCell(day, false, date));
    }

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0', marginBottom: '0', background: '#f5f5f5' }}>
                {dayHeaders.map((day) => (
                    <div key={day} style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid #ddd' }}>
                        {day}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0' }}>
                {calendarDays}
            </div>
        </div>
    );
}
