import BookingDetails from '@/components/booking_details';
import Navbar from '@/components/navbar'
import React from 'react'
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Booking({ params }) {

    const { lang, ID } = params;

    const role = cookies().get('role')?.value ?? null; // 🔥 más limpio

    const currentID = Number(ID);

    // 👉 Seguridad básica (evita NaN)
    if (!currentID) {
        return <div>Invalid booking</div>
    }

    const prevID = currentID - 1;
    const nextID = currentID + 1;

  return (
    <div className='flex flex-col items-center w-full'>

        <Navbar role={role}/>

        {/* 🔥 Navegación entre bookings */}
        <div className="flex gap-3 my-4">

            {prevID > 0 && (
              <Link
                prefetch={true}   // 🚀 navegación instantánea
                href={`/${lang}/booking_details/${prevID}`}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
              >
                ← Previous
              </Link>
            )}

            <Link
              prefetch={true}
              href={`/${lang}/booking_details/${nextID}`}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
            >
              Next →
            </Link>

        </div>

        <BookingDetails bookingID={currentID} role={role}/>

    </div>
  )
}
