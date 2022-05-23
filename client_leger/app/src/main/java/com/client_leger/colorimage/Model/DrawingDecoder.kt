package com.client_leger.colorimage.Model

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.client_leger.colorimage.Api.Contest.ContestHttpRequest
import com.client_leger.colorimage.Api.Drawing.DrawingHttpRequest
import com.client_leger.colorimage.Constants.Constants
import com.github.kittinunf.fuel.core.ResponseResultOf

object DrawingDecoder {

    suspend fun byteArrayToBitmap(id:String):Bitmap?{
        val (_,response,_) = DrawingHttpRequest.getDrawing(id)
        return if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            null
        } else{
            return BitmapFactory.decodeByteArray(response.data, 0, response.data.size)
        }
    }

    suspend fun byteArrayToBitmapContest(id: String):Bitmap?{
        val (_,response,_) = ContestHttpRequest.pictureById(id)
        return if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            null
        } else{
            return BitmapFactory.decodeByteArray(response.data, 0, response.data.size)
        }
    }


}
