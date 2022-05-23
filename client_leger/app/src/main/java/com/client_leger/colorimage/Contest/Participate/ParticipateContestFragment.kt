package com.client_leger.colorimage.Contest.Participate

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.addCallback
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Contest.Participate.Data.DrawingInfoData
import com.client_leger.colorimage.Contest.Participate.Intermediate.IntermediateParticipateContestServer
import com.client_leger.colorimage.Loading.LoadingDialog
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.FragmentContestParticipateBinding
import com.client_leger.colorimage.drawing.intermediate.IntermediateDrawingServer
import kotlinx.coroutines.launch

class ParticipateContestFragment : Fragment() {
    private var _binding: FragmentContestParticipateBinding? = null
    private val binding get() = _binding!!

    private var selectedPosition: Int = -1
    private var drawings: ArrayList<DrawingInfoData>? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentContestParticipateBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val loading = LoadingDialog(requireActivity())

        lifecycleScope.launch {
            loading.startLoadingDialog()
            if(userCanStillPublishEntry()) {
                binding.contestWrapper.visibility = View.VISIBLE
                binding.message.visibility = View.GONE
                binding.participateButton.visibility = View.VISIBLE

                drawings = generateCurrentDrawing()
                if (drawings != null) {

                    val allDrawingsAdapter = ParticipateContestAdapter(drawings!!)

                    binding.recyclerContestParticipate.adapter = allDrawingsAdapter
                    binding.recyclerContestParticipate.layoutManager = GridLayoutManager(context ,3)
                    binding.recyclerContestParticipate.setHasFixedSize(true)

                    allDrawingsAdapter.setOnItemClickListener(object :
                        ParticipateContestAdapter.OnItemClickListener {
                        override fun onItemClick(position: Int) {
                            selectedPosition = position
                        }
                    })
                }else{
                    binding.contestWrapper.visibility = View.GONE
                    binding.message.visibility = View.VISIBLE
                    binding.participateButton.visibility = View.GONE
                    binding.message.text = Constants.NO_DRAWING
                }
            }
            loading.dismissDialog()
        }
        binding.participateButton.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                loading.startLoadingDialog()
                if(selectedPosition == -1) Toast.makeText(activity, Constants.NO_DRAWING_SELECTED, Toast.LENGTH_LONG).show()
                else participateToContest()
                loading.dismissDialog()
            }
        }

        requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner) {
            findNavController().navigate(R.id.action_ParticipateContestFragment_to_ContestFragment)
        }


    }

    private suspend fun generateCurrentDrawing(): ArrayList<DrawingInfoData>? {
        val allDrawings = IntermediateDrawingServer.getIdOfAllDrawingsContributed() ?: return null
        return IntermediateParticipateContestServer.setDrawingInfo(allDrawings)
    }

    private suspend fun userCanStillPublishEntry():Boolean{
        when(IntermediateParticipateContestServer.userCanStillPublishEntry()){
            null -> {
                binding.recyclerContestParticipate.visibility = View.GONE
                binding.message.visibility = View.VISIBLE
                binding.message.text = Constants.DEFAULT_ERROR_MESSAGE
                return false
            }
            true -> {
                binding.recyclerContestParticipate.visibility = View.VISIBLE
                binding.message.visibility = View.GONE
                binding.message.text = ""
                return true
            }
            false -> {
                binding.recyclerContestParticipate.visibility = View.GONE
                binding.message.visibility = View.VISIBLE
                binding.participateButton.visibility = View.GONE
                binding.message.text = Constants.DRAWING_WAS_SUBMIT
                return false

            }
        }
    }

    private suspend fun participateToContest(){
        val selectedDrawing: DrawingInfoData = drawings!![selectedPosition]
        if(IntermediateParticipateContestServer.uploadConcoursEntry(selectedDrawing.id)){
            findNavController().navigate(R.id.action_ParticipateContestFragment_self)
        }else{
            Toast.makeText(activity, Constants.DEFAULT_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
        }

    }
}
