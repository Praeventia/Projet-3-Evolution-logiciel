package com.client_leger.colorimage.Regex

object Regex {
    fun checkEmptyField(content:String): Boolean{
        val filteredMessage: String = content.replace("[\\t\\n\\r ]+".toRegex(), "")
        return filteredMessage.isEmpty()
    }
}
