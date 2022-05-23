package com.client_leger.colorimage.Home

import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.FragmentMainBinding
import com.client_leger.colorimage.Chat.SocketHandler
import com.client_leger.colorimage.Avatar.Avatar
import com.client_leger.colorimage.Loading.LoadingDialog
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.Model.User
import com.client_leger.colorimage.Chat.presentation.ChatActivity
import com.squareup.picasso.MemoryPolicy
import com.squareup.picasso.NetworkPolicy
import com.squareup.picasso.Picasso
import kotlinx.coroutines.launch
import com.client_leger.colorimage.album.AlbumActivity
import com.client_leger.colorimage.dialogs.CreateDrawingDialogFragment
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

/**
 * A simple [Fragment] subclass as the default destination in the navigation.
 */
class MainFragment : Fragment() {

    private var _binding: FragmentMainBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        _binding = FragmentMainBinding.inflate(inflater, container, false)
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        var userAuthenticated = User.userIsAuthenticated()
        setLayout(userAuthenticated)

        if(userAuthenticated){
            lifecycleScope.launch {
                if (!User.isAuthorized()){
                    User.hasBeenDisconnected = true
                    User.disconnect()
                    Avatar.clearAvatarList()
                    SocketHandler.closeConnection()
                    findNavController().navigate(R.id.action_MainFragment_to_MainFragment)
                }
            }
        }

        if(User.hasBeenDisconnected){
            Toast.makeText(activity, Constants.EXPIRED_SESSION, Toast.LENGTH_SHORT).show()
            User.hasBeenDisconnected = false
        }

        binding.singin.setOnClickListener {
            findNavController().navigate(R.id.action_MainFragment_to_SignUpFragment)
        }

        (getView()?.findViewById(R.id.chat_info) as View).setOnClickListener {
            activity?.let{
                val intent = Intent (it, ChatActivity::class.java)
                it.startActivity(intent)
            }
        }

        binding.joinDrawing.setOnClickListener {
            if (userAuthenticated){
                activity?.let {
                    val intent = Intent(it, AlbumActivity::class.java)
                    it.startActivity(intent)
                }
            }
            else{
                Toast.makeText(context, "Veuillez-vous connecter pour voir les albums", Toast.LENGTH_LONG).show()
            }
        }

        binding.createDrawing.setOnClickListener{
            if (userAuthenticated){
                val dialog = CreateDrawingDialogFragment(fragment = null)
                dialog.show(parentFragmentManager, "")
            }
            else{
                Toast.makeText(context, "Veuillez-vous connecter avant de créer un nouveau dessin", Toast.LENGTH_LONG).show()
            }
        }

        binding.contest.setOnClickListener{
            if (userAuthenticated){
                findNavController().navigate(R.id.action_MainFragment_to_ContestFragment)
            }
            else{
                Toast.makeText(context, "Veuillez-vous connecter pour voir le concours", Toast.LENGTH_LONG).show()
            }
        }

        binding.leaderboard.setOnClickListener{
            if (userAuthenticated){
                findNavController().navigate(R.id.action_MainFragment_to_LeaderboardFragment)
            }
            else{
                Toast.makeText(context, "Veuillez-vous connecter pour voir le leaderboard", Toast.LENGTH_LONG).show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun setLayout(userConnected:Boolean){
        if(userConnected){
            binding.profile.visibility = View.VISIBLE
            binding.login.visibility = View.GONE
            binding.loginImage.visibility = View.GONE
            binding.logout.visibility = View.VISIBLE
            binding.logout.text = Constants.USER_LOGOUT
            (view?.findViewById(R.id.chat_info) as View).visibility = View.VISIBLE
            listenUnreadMessages()
            binding.logoutImage.visibility = View.VISIBLE
            binding.singin.visibility = View.GONE
            binding.divisionBar.visibility = View.GONE
            binding.profileUsername.text = User.getUsername()
            Picasso.get()
                .load(User.getAvatar())
                .memoryPolicy(MemoryPolicy.NO_CACHE)
                .networkPolicy(NetworkPolicy.NO_CACHE)
                .into(binding.avatarImage)

            binding.profile.setOnClickListener {
                findNavController().navigate(R.id.action_MainFragment_to_ProfileFragment)
            }
            binding.logoutWrapper.setOnClickListener {
                viewLifecycleOwner.lifecycleScope.launch {
                    userDisconnect()
                }
            }

        }else{
            binding.login.text = Constants.USER_LOGIN
            (view?.findViewById(R.id.chat_info) as View).visibility = View.GONE
            binding.profile.visibility = View.GONE
            binding.loginWrapper.setOnClickListener {
                findNavController().navigate(R.id.action_MainFragment_to_LoginFragment)
            }
            binding.singin.setOnClickListener {
                findNavController().navigate(R.id.action_MainFragment_to_SignUpFragment)
            }
        }
    }

    private fun listenUnreadMessages() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                UnreadMessageTracker.unreadMessagesState.onEach {
                    updateUnreadBadge(it.unreadMessagesChannels)
                }.collect()
            }
        }
    }

    private fun updateUnreadBadge(list : Map<String,Int>) {
        val unreadMessages = list.values.sum()

        val messageBadge = view?.findViewById<TextView>(R.id.new_message_badge)

        if (unreadMessages > 0) {
            messageBadge!!.visibility  = View.VISIBLE
            messageBadge.text = unreadMessages.toString()
        }
        else {
            messageBadge!!.visibility  = View.INVISIBLE
        }
    }


    private suspend fun userDisconnect(){
        User.disconnect()
        SocketHandler.closeConnection()
        setLayout(User.userIsAuthenticated())
        Avatar.clearAvatarList()
        Toast.makeText(activity, Constants.LOGOUT_SUCCES_MESSAGE, Toast.LENGTH_SHORT).show()
        (view?.findViewById(R.id.chat_info) as View).visibility = View.GONE
        binding.login.text = Constants.USER_LOGIN
        binding.singin.visibility = View.VISIBLE
        binding.divisionBar.visibility = View.VISIBLE
        findNavController().navigate(R.id.action_MainFragment_to_MainFragment)
    }


}


