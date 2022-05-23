package com.client_leger.colorimage.Model

import java.text.SimpleDateFormat
import java.time.LocalDateTime
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.*

object Timestamp {

    fun generateTimeStamp(dateTime: LocalDateTime): String{
        var hours:String = setFormat(dateTime.hour.toString())
        var minutes:String = setFormat(dateTime.minute.toString())
        var seconds:String = setFormat(dateTime.second.toString())
        return "$hours:$minutes:$seconds"
    }

    private fun setFormat(time: String): String{
        return if(time.length < 2){
            "0$time"
        }else{
            time
        }
    }

    fun stringToDate(date:String): Date {
        val parsedDate = ZonedDateTime.parse(date, DateTimeFormatter.ISO_DATE_TIME)
        return Date.from(parsedDate.toInstant())
    }

    fun dateToHourDate(date: Date): String{
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'hh:mm:ss.SSSXXX", Locale.getDefault())
        val strDate: String = dateFormat.format(date)
        val parsedDate = ZonedDateTime.parse(strDate, DateTimeFormatter.ISO_DATE_TIME)
        return parsedDate.format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"))
    }

    fun dateToDate(date: Date): String{
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'hh:mm:ss.SSSXXX", Locale.getDefault())
        val strDate: String = dateFormat.format(date)
        val parsedDate = ZonedDateTime.parse(strDate, DateTimeFormatter.ISO_DATE_TIME)
        return parsedDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
    }

    fun dateToDateHour(date: Date): String{
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'hh:mm:ss.SSSXXX", Locale.getDefault())
        val strDate: String = dateFormat.format(date)
        val parsedDate = ZonedDateTime.parse(strDate, DateTimeFormatter.ISO_DATE_TIME)
        return parsedDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))
    }

    fun dateToHour(date: Date): String{
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'hh:mm:ss.SSSXXX", Locale.getDefault())
        val strDate: String = dateFormat.format(date)
        val parsedDate = ZonedDateTime.parse(strDate, DateTimeFormatter.ISO_DATE_TIME)
        return parsedDate.format(DateTimeFormatter.ofPattern("HH:mm:ss"))
    }

    fun secondsToHours(timeInSecond: String): String{
        val timeInt = timeInSecond.split('.')[0].toInt()
        val hours:Int = timeInt / 3600
        val minutes: Int = (timeInt % 3600)/60
        val seconds: Int = timeInt % 60
        val hour = setFormat(hours.toString())
        val minute = setFormat(minutes.toString())
        val second = setFormat(seconds.toString())
        return hour + "h" + minute + "m" + second + "s"
    }

}
