package com.client_leger.colorimage.album

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.tabs.TabLayoutMediator
import androidx.fragment.app.Fragment
import com.client_leger.colorimage.R
import com.client_leger.colorimage.album.adapter.ALBUMS_LIST_PAGE_INDEX
import com.client_leger.colorimage.album.adapter.ALBUMS_SHARE_PAGE_INDEX
import com.client_leger.colorimage.album.adapter.AlbumPagerAdapter
import com.client_leger.colorimage.album.adapter.MY_ALBUM_PAGE_INDEX
import com.client_leger.colorimage.databinding.FragmentViewAlbumBinding

class HomeViewPagerFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val binding = FragmentViewAlbumBinding.inflate(inflater, container, false)
        val tabLayout = binding.tabs
        val viewPager = binding.viewPager
        val tabReturn = arguments?.getInt("tab")
        viewPager.adapter = AlbumPagerAdapter(this)

        TabLayoutMediator(tabLayout, viewPager) { tab, position ->
            tab.setIcon(getTabIcon(position))
            tab.text = getTabTitle(position)
        }.attach()

        (activity as AppCompatActivity).setSupportActionBar(binding.toolbar)

        if (tabReturn != null){
            viewPager.currentItem = tabReturn
        }

        return binding.root
    }

    private fun getTabIcon(position: Int): Int {
        return when (position) {
            MY_ALBUM_PAGE_INDEX -> R.drawable.single_album
            ALBUMS_LIST_PAGE_INDEX -> R.drawable.multi_albums
            ALBUMS_SHARE_PAGE_INDEX ->R.drawable.exposition_album
            else -> throw IndexOutOfBoundsException()
        }
    }

    private fun getTabTitle(position: Int): String? {
        return when (position) {
            MY_ALBUM_PAGE_INDEX -> getString(R.string.myAlbum)
            ALBUMS_LIST_PAGE_INDEX -> getString(R.string.AlbumList)
            ALBUMS_SHARE_PAGE_INDEX -> getString(R.string.albumShare)
            else -> null
        }
    }
}
