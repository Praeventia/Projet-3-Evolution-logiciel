package com.client_leger.colorimage.Contest.ContestVote.Data

data class VoteUpdateData(
    var hasAlreadyUpVoted: Boolean,
    var hasAlreadyDownVoted: Boolean,
    var vote: String,
)
