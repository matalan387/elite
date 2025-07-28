import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Star, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const GreasySpoonApp = () => {
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [newEvent, setNewEvent] = useState({
    name: '',
    spoonName: '',
    date: ''
  });

  const [rating, setRating] = useState({
    eventEase: 5,
    eventVibes: 5,
    spoonVibes: 5,
    spoonPrice: 5,
    spoonPortion: 5
  });

  // Load events from backend
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      if (response.ok) {
        const eventsData = await response.json();
        setEvents(eventsData);
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!newEvent.name || !newEvent.spoonName || !newEvent.date) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        const newEventData = await response.json();
        setEvents([newEventData, ...events]);
        setNewEvent({ name: '', spoonName: '', date: '' });
        setShowCreateForm(false);
      } else {
        console.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const submitRating = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${selectedEvent.id}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rating),
      });

      if (response.ok) {
        // Refresh events to get updated averages
        await fetchEvents();
        setShowRatingForm(false);
        setSelectedEvent(null);
        setRating({
          eventEase: 5,
          eventVibes: 5,
          spoonVibes: 5,
          spoonPrice: 5,
          spoonPortion: 5
        });
      } else {
        console.error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const RatingSlider = ({ label, value, onChange, criteria }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-lg font-bold text-blue-600">{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(criteria, parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-gray-600">Loading events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Greasy Spoon Events</h1>
          <p className="text-gray-600 mt-2">Rate your local greasy spoon experiences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Create Event Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Create New Event
          </button>
        </div>

        {/* Create Event Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sunday Breakfast Meetup"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Greasy Spoon Name
                </label>
                <input
                  type="text"
                  value={newEvent.spoonName}
                  onChange={(e) => setNewEvent({...newEvent, spoonName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tony's Cafe"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={createEvent}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  Create Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={submitting}
                  className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Events</h2>
          
          {events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">No events created yet. Create your first event!</p>
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                    <div className="flex items-center gap-4 text-gray-600 mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{event.spoonName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowRatingForm(true);
                    }}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                  >
                    <Star size={16} />
                    Rate
                  </button>
                </div>

                {/* Ratings Display */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Event Ratings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ease:</span>
                        <span className="font-medium">
                          {event.ratings.eventEase.average || 'N/A'} 
                          {event.ratings.eventEase.count > 0 && 
                            <span className="text-xs text-gray-500 ml-1">
                              ({event.ratings.eventEase.count} votes)
                            </span>
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vibes:</span>
                        <span className="font-medium">
                          {event.ratings.eventVibes.average || 'N/A'}
                          {event.ratings.eventVibes.count > 0 && 
                            <span className="text-xs text-gray-500 ml-1">
                              ({event.ratings.eventVibes.count} votes)
                            </span>
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Greasy Spoon Ratings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vibes:</span>
                        <span className="font-medium">
                          {event.ratings.spoonVibes.average || 'N/A'}
                          {event.ratings.spoonVibes.count > 0 && 
                            <span className="text-xs text-gray-500 ml-1">
                              ({event.ratings.spoonVibes.count} votes)
                            </span>
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">
                          {event.ratings.spoonPrice.average || 'N/A'}
                          {event.ratings.spoonPrice.count > 0 && 
                            <span className="text-xs text-gray-500 ml-1">
                              ({event.ratings.spoonPrice.count} votes)
                            </span>
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Portion:</span>
                        <span className="font-medium">
                          {event.ratings.spoonPortion.average || 'N/A'}
                          {event.ratings.spoonPortion.count > 0 && 
                            <span className="text-xs text-gray-500 ml-1">
                              ({event.ratings.spoonPortion.count} votes)
                            </span>
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rating Form Modal */}
        {showRatingForm && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Rate: {selectedEvent.name}
                </h2>
                <p className="text-gray-600 mb-6">at {selectedEvent.spoonName}</p>
                
                <div>
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Event</h3>
                    <RatingSlider
                      label="Ease"
                      value={rating.eventEase}
                      onChange={(criteria, value) => setRating({...rating, [criteria]: value})}
                      criteria="eventEase"
                    />
                    <RatingSlider
                      label="Vibes"
                      value={rating.eventVibes}
                      onChange={(criteria, value) => setRating({...rating, [criteria]: value})}
                      criteria="eventVibes"
                    />
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Greasy Spoon</h3>
                    <RatingSlider
                      label="Vibes"
                      value={rating.spoonVibes}
                      onChange={(criteria, value) => setRating({...rating, [criteria]: value})}
                      criteria="spoonVibes"
                    />
                    <RatingSlider
                      label="Price"
                      value={rating.spoonPrice}
                      onChange={(criteria, value) => setRating({...rating, [criteria]: value})}
                      criteria="spoonPrice"
                    />
                    <RatingSlider
                      label="Portion"
                      value={rating.spoonPortion}
                      onChange={(criteria, value) => setRating({...rating, [criteria]: value})}
                      criteria="spoonPortion"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={submitRating}
                      disabled={submitting}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 className="animate-spin" size={16} />}
                      Submit Rating
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRatingForm(false);
                        setSelectedEvent(null);
                      }}
                      disabled={submitting}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default GreasySpoonApp;