// client/src/components/ReviewsSection.jsx
import React from 'react';
import { FaStar } from 'react-icons/fa';
import './Sections.css'; // Use shared styles

// Placeholder review data
const sampleReviews = [
    { id: 1, name: "Maria S.", date: "April 2025", rating: 5, text: "Absolutely stunning place! So peaceful and the views were incredible. The pool was perfect. Highly recommend." },
    { id: 2, name: "John D.", date: "March 2025", rating: 4, text: "Great family getaway. Loved the amenities, especially the grill area. Wi-Fi was a bit spotty sometimes, but overall a fantastic stay." },
    { id: 3, name: "Chloe R.", date: "February 2025", rating: 5, text: "The photos don't do it justice. Such a relaxing atmosphere. The hosts were very helpful too!" }
];

function ReviewsSection({ locationSlug }) { // Accept locationSlug if reviews are per location

    // TODO: Fetch actual reviews based on locationSlug from backend API

    return (
        <div id="reviews" className="section-container reviews-section">
            {/* TODO: Fetch overall rating */}
            <h2 className="section-title"><FaStar className="star-icon text-brand-xanthous inline-block mr-1 mb-1"/> 4.8 · {sampleReviews.length} Reviews {locationSlug && `for ${locationSlug}`}</h2>

            {/* Review List Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sampleReviews.map(review => (
                    <div key={review.id} className="border-b border-brand-border pb-4 mb-4">
                        <div className="flex items-center mb-2">
                            {/* Placeholder Avatar */}
                            <div className="w-10 h-10 rounded-full bg-brand-light-gray mr-3"></div>
                            <div>
                                <p className="font-semibold text-brand-text-dark">{review.name}</p>
                                <p className="text-sm text-brand-text-secondary">{review.date}</p>
                            </div>
                             {/* Rating */}
                             <div className='ml-auto flex items-center'>
                                {[...Array(review.rating)].map((_, i) => <FaStar key={i} className="text-brand-xanthous" />)}
                                {[...Array(5 - review.rating)].map((_, i) => <FaStar key={`empty-${i}`} className="text-brand-light-gray" />)}
                            </div>
                        </div>
                        <p className="text-brand-text-primary leading-relaxed">{review.text}</p>
                    </div>
                ))}
            </div>

             {/* Add Review Form Placeholder */}
             <div className="mt-10 pt-6 border-t border-brand-border">
                <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
                <form>
                    {/* Add form fields: Name, Rating (stars), Comment */}
                    <textarea placeholder="Share your experience..." rows="4" className="w-full p-3 border border-brand-border rounded-lg mb-4 focus:ring-1 focus:ring-brand-avocado focus:border-brand-avocado outline-none"></textarea>
                    {/* Add rating input */}
                    <button type="submit" className="btn-secondary" disabled>Submit Review (WIP)</button>
                </form>
             </div>
        </div>
    );
}

export default ReviewsSection;