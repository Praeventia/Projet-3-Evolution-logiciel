package com.client_leger.colorimage.Leaderboard

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import com.client_leger.colorimage.Avatar.Avatar
import com.client_leger.colorimage.Chat.SocketHandler
import com.client_leger.colorimage.Leaderboard.data.Intermediate.ServerLeaderboard
import com.client_leger.colorimage.Leaderboard.data.LeaderboardData
import com.client_leger.colorimage.Loading.LoadingDialog
import com.client_leger.colorimage.Model.User
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.FragmentLeaderboardBinding
import kotlinx.coroutines.launch

class LeaderboardFragment : Fragment() {

    private var _binding: FragmentLeaderboardBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentLeaderboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val loading = LoadingDialog(requireActivity())

        lifecycleScope.launch {
            loading.startLoadingDialog()

            if (!User.isAuthorized()){
                User.hasBeenDisconnected = true
                User.disconnect()
                Avatar.clearAvatarList()
                SocketHandler.closeConnection()
                findNavController().navigate(R.id.action_LeaderboardFragment_to_MainFragment)
                loading.dismissDialog()
                return@launch
            }

            val leaderboardList:ArrayList<LeaderboardData> = generateList()
            val adapter = LeaderboardAdapter(leaderboardList)

            binding.recyclerLeaderboard.adapter = adapter
            binding.recyclerLeaderboard.layoutManager = GridLayoutManager(context, 1)
            binding.recyclerLeaderboard.setHasFixedSize(true)
            loading.dismissDialog()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private suspend fun generateList(): ArrayList<LeaderboardData>{
        val list = ArrayList<LeaderboardData>()
        val mostMessageLeaderboard = ServerLeaderboard.mostMessageSent()
        if (mostMessageLeaderboard != null) {
            list.add(mostMessageLeaderboard)
        }
        val mostTotalEditionTime = ServerLeaderboard.mostTotalEditionTime()
        if (mostTotalEditionTime != null) {
            list.add(mostTotalEditionTime)
        }
        val mostPixelCross = ServerLeaderboard.mostPixelCross()
        if (mostPixelCross != null) {
            list.add(mostPixelCross)
        }
        val mostLineCount = ServerLeaderboard.mostLineCount()
        if (mostLineCount != null) {
            list.add(mostLineCount)
        }
        val mostShapeCount = ServerLeaderboard.mostShapeCount()
        if (mostShapeCount != null) {
            list.add(mostShapeCount)
        }
        val mostRecentLogin = ServerLeaderboard.mostRecentLogin()
        if (mostRecentLogin != null) {
            list.add(mostRecentLogin)
        }
        val mostLogin = ServerLeaderboard.mostLogin()
        if (mostLogin != null) {
            list.add(mostLogin)
        }
        val mostOldLogin = ServerLeaderboard.mostOldLogin()
        if (mostOldLogin != null) {
            list.add(mostOldLogin)
        }
        val mostDisconnect = ServerLeaderboard.mostDisconnect()
        if (mostDisconnect != null) {
            list.add(mostDisconnect)
        }
        val mostAverageCollaborationTime = ServerLeaderboard.mostAverageCollaborationTime()
        if (mostAverageCollaborationTime != null) {
            list.add(mostAverageCollaborationTime)
        }
        val mostRoomJoin = ServerLeaderboard.mostRoomJoin()
        if (mostRoomJoin != null) {
            list.add(mostRoomJoin)
        }
        val mostAlbumJoin = ServerLeaderboard.mostAlbumJoin()
        if (mostAlbumJoin != null) {
            list.add(mostAlbumJoin)
        }
        val mostDrawingContributed = ServerLeaderboard.mostDrawingContributed()
        if (mostDrawingContributed != null) {
            list.add(mostDrawingContributed)
        }
        val mostVote = ServerLeaderboard.mostVote()
        if (mostVote != null) {
            list.add(mostVote)
        }
        val mostConcoursEntry = ServerLeaderboard.mostConcoursEntry()
        if (mostConcoursEntry != null) {
            list.add(mostConcoursEntry)
        }
        return list
    }



}
