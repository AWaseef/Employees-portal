'use client'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react'
import NotFound from './not_found';
import { useTranslations } from 'next-intl';
import { MapPinIcon, Mail, Phone, Calendar, Timer } from 'lucide-react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import RideDetails from './ride_details';
import Loading from './loading';
import Link from 'next/link';
import { MessageCircleMore } from 'lucide-react';

export default function BookingDetails({ bookingID, role }) {

  const router = useRouter();

  const [rides, setRides] = useState([]);
  const [bookingDetails, setBookingDetails] = useState(null); // 🔥 antes []
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRide, setShowRide] = useState(null);

  const rideDict = useTranslations("pick");
  const statusrideDict = useTranslations("status");

  /* =====================================================
     🚀 LOAD DATA (OPTIMIZADO)
  ===================================================== */
  useEffect(() => {

    const loadData = async () => {
      setIsLoading(true);

      try {

        const [detailsRes, ridesRes] = await Promise.all([
          fetch(`/api/get_booking_details/${bookingID}`, {
            credentials: 'include'
          }),
          fetch(`/api/get_booking_details/${bookingID}/get_rides`, {
            credentials: 'include'
          })
        ]);

        if (detailsRes.status === 401 || ridesRes.status === 401) {
          router.push('/unauthorized');
          return;
        }

        if (detailsRes.status === 404) {
          setNotFound(true);
          return;
        }

        const detailsObject = await detailsRes.json();
        const ridesObject = await ridesRes.json();

        setBookingDetails(detailsObject);
        setRides(ridesObject.results || []);

      } finally {
        setIsLoading(false);
      }
    };

    loadData();

  }, [bookingID, router]); // 🔥 importante para Next/Prev


  /* =====================================================
     🎯 STATUS UI
  ===================================================== */
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "secondary"
      case "confirmed": return "outline"
      case "completed": return "default"
      case "cancelled": return "destructive"
      default: return "secondary"
    }
  }

  const getColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-orange-400"
      case "confirmed": return "border-green-500 text-green-500"
      case "completed": return "bg-green-500"
      case "canceled": return "bg-red-400"
      default: return ""
    }
  }


  /* =====================================================
     🚀 GET SINGLE RIDE (OPTIMIZADO)
  ===================================================== */
  const getRide = useCallback(async (e) => {

    const id = e.target.id;

    const response = await fetch(
      `/api/get_booking_details/${bookingID}/get_rides/${id}/`,
      { credentials: 'include' }
    );

    if (response.status === 200) {
      const detailsObject = await response.json();
      setShowRide(detailsObject);
    }
    else if (response.status === 401)
      router.push('/unauthorized');
    else if (response.status === 404)
      setNotFound(true);

  }, [bookingID, router]);


  /* =====================================================
     🧠 STATES
  ===================================================== */
  if (notFound) return <NotFound />
  if (isLoading || !bookingDetails) return <Loading />


  /* =====================================================
     🎨 UI
  ===================================================== */
  return (
    <div className='w-full min-h-screen h-max px-12 mt-30 mb-10 lg:w-[70%]'>

      {showRide &&
        <RideDetails role={role} rideData={showRide} setShowRide={setShowRide} />
      }

      <h1 className='font-medium text-2xl my-3'>
        {rideDict("booking")} #{bookingDetails.booking_number}
      </h1>

      {bookingDetails.booking_number_ex &&
        <h2 className='font-medium text-xl my-3 text-neutral-700'>
          {rideDict("exbooking")} #{bookingDetails.booking_number_ex}
        </h2>
      }

      {/* ===================== TRIP DETAILS ===================== */}
      <div className='flex flex-col lg:flex-row gap-5 justify-between'>

        <div className='flex flex-col gap-3 w-[80%]'>

          <h2 className='font-medium text-lg my-1 text-neutral-500'>
            {rideDict("tripDetails")}
          </h2>

          {/* PICKUP / DROPOFF */}
          <div className="flex gap-4 w-100 max-w-[90%] ">
            <div className="flex flex-col items-center pt-2">
              {bookingDetails.dropoff_location ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-md"></div>
                  <div className="w-px h-14 bg-gray-300 my-2"></div>
                  <MapPinIcon className="w-4 h-4 text-red-500" />
                </>
              ) :
                <MapPinIcon className="w-5 h-7 text-gray-700" />
              }
            </div>

            <div className="flex flex-col h-full gap-4">
              <div>
                <p className="font-medium">{rideDict("pickupLocation")}</p>
                <p className="text-gray-600">
                  {bookingDetails.pickup_location || rideDict("notProvided")}
                </p>
              </div>

              {bookingDetails.dropoff_location &&
                <div>
                  <p className="font-medium">{rideDict("destination")}</p>
                  <p className="text-gray-600">
                    {bookingDetails.dropoff_location}
                  </p>
                </div>
              }
            </div>
          </div>

          {/* PICKUP TIME */}
          {bookingDetails?.datetime_pickup &&
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-orange-500" />
              <p className="text-gray-600">
                {bookingDetails.datetime_pickup.split("T")[0]}{" "}
                {bookingDetails.datetime_pickup.split("T")[1]}
              </p>
            </div>
          }

          {/* NOTE */}
          {bookingDetails.customer_note &&
            <div className='flex items-center space-x-3 w-[70%]'>
              <MessageCircleMore size={22} className="text-orange-500" />
              <div>
                <p className="font-medium">{rideDict("comments")}</p>
                <p className="text-gray-600">{bookingDetails.customer_note}</p>
              </div>
            </div>
          }

        </div>


        {/* ===================== CONTACT ===================== */}
        <div className='flex flex-col gap-7'>

          <div className='flex flex-col gap-1'>
            <h2 className='font-medium text-lg my-1 text-neutral-500'>
              {rideDict("contactInfo")}
            </h2>

            {bookingDetails.email &&
              <a href={`mailto:${bookingDetails.email}`}
                className='flex items-center gap-2 text-lg hover:text-orange-600'>
                <Mail size={17} />
                {bookingDetails.email}
              </a>
            }

            {bookingDetails.phone_number &&
              <div className='flex items-center gap-2 text-lg'>
                <Phone size={17} />
                {bookingDetails.phone_number}
              </div>
            }
          </div>

        </div>
      </div>


      {/* ===================== RIDES TABLE ===================== */}
      <div className="overflow-x-auto mt-3">

        <h2 className='font-medium text-lg my-2 text-neutral-600'>
          {rideDict("bookingRides")}
        </h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{rideDict("rideId")}</TableHead>
              <TableHead>{rideDict("status")}</TableHead>
              <TableHead>{rideDict("returnRide")}</TableHead>
              <TableHead>{rideDict("driver")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rides.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-muted/50">

                <TableCell
                  id={booking.id}
                  onClick={getRide}
                  className="font-medium hover:text-orange-500 cursor-pointer">
                  {booking.id}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={getStatusVariant(booking.status)}
                    className={getColor(booking.status)}>
                    {statusrideDict(booking.status.toLowerCase()) || booking.status}
                  </Badge>
                </TableCell>

                <TableCell>{String(booking.return_ride)}</TableCell>

                {booking?.id_driver ?
                  <TableCell>
                    <Link href={`/drivers/${booking?.id_driver?.id}`}
                      className='hover:text-orange-400'>
                      {booking?.id_driver?.first_name} {booking?.id_driver?.last_name}
                    </Link>
                  </TableCell>
                  :
                  <TableCell>{rideDict("unassigned")}</TableCell>
                }

              </TableRow>
            ))}
          </TableBody>
        </Table>

        {rides.length === 0 &&
          <div className="text-center py-8 text-muted-foreground">
            <p>{rideDict("noRecords")}</p>
          </div>
        }

      </div>
    </div>
  )
}
