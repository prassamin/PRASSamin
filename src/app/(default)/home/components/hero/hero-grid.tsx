"use client";

import React from "react";
import {
  SiNextdotjs,
  SiTypescript,
  SiRedis,
  SiTailwindcss,
} from "react-icons/si";
import { BiLogoPostgresql } from "react-icons/bi";
import { FaGolang } from "react-icons/fa6";

export const HeroGrid: React.FC = () => {
  return (
    <div className="select-none">
      <div
        className="p-12 absolute w-[63vw] top-[35%] right-[-20vw] 2xl:left-1/2 2xl:max-w-[1000px] max-md:min-w-[500px] max-md:bottom-[-40%] max-md:right-[-8rem] max-md:opacity-30 max-md:pointer-events-none max-md:[&_.hero-illustration-card]:opacity-80 select-none"
        style={
          {
            perspective: "100px",
            transformStyle: "preserve-3d",
            transform: "rotateX(45deg) rotateZ(45deg)",
            translate: "none",
            aspectRatio: "984 / 802",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 110%), linear-gradient(to right, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)",
            maskImage:
              "linear-gradient(to bottom, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 110%), linear-gradient(to right, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          } as React.CSSProperties
        }
      >
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          fill="none"
          height="702"
          viewBox="0 0 1122 702"
          width="1122"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M28.3105 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M55.6377 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M82.9482 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M110.275 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M137.586 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M164.897 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M192.224 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M219.534 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M246.846 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M274.172 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M301.483 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M328.81 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M356.121 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M383.432 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M410.759 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M438.069 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M465.396 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M492.707 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M520.018 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M547.345 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M574.655 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M601.982 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M629.293 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M656.604 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M683.931 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M711.241 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M738.568 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M765.879 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M793.19 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M820.517 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M847.828 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M875.139 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M902.466 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M929.775 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M957.103 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M984.414 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1011.72 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M1039.05 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1066.36 1V701.129"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.09307"
          ></path>
          <path
            d="M1093.69 1V701.129"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 675.192H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 649.27H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 623.333H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 597.412H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 571.475H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 545.538H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 519.616H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 493.68H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 467.758H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 441.821H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 415.884H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 389.962H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 364.025H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 338.104H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 312.167H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 286.229H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 260.308H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 234.371H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 208.449H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 182.513H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 156.591H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 130.654H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 104.717H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 78.7954H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 52.8584H1"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
          <path
            d="M1121 26.9365H1"
            stroke="#171717"
            strokeDasharray="3.17 3.17"
            strokeMiterlimit="10"
            strokeWidth="1.58416"
          ></path>
          <path
            d="M1121 1H1V701.129H1121V1Z"
            stroke="#171717"
            strokeMiterlimit="10"
            strokeWidth="1.10891"
          ></path>
        </svg>
        <div
          className="hero-illustration-card group border border-neutral-800 rounded-xl size-72 relative pointer-events-auto cursor-pointer"
          id="hero-vortex-card"
        >
          <div className="absolute bg-neutral-950 inset-[-1px] border border-neutral-800 rounded-xl group-hover:-translate-[15px] transition-all duration-300 ease-in-out pointer-events-none">
            <svg
              className="absolute inset-0 rounded-xl"
              fill="none"
              height="280"
              viewBox="0 0 280 280"
              width="280"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_2178_104205)">
                <rect fill="#0A0A0A" height="280" width="280"></rect>
                <path
                  d="M286.566 124.511C288.166 113.951 288.982 103.286 289.008 92.6045M289.008 92.6045C289.194 -11.127 212.703 -79.8044 118.123 -60.7897M289.008 92.6045C297.502 78.2996 309.16 65.1415 323.658 53.4866M289.008 92.6045C297.502 78.3032 309.16 65.1415 323.658 53.4866M289.008 92.6045C288.822 196.336 212.013 295.84 117.451 314.851M118.123 -60.7897C23.543 -41.775 -53.2489 57.7258 -53.4384 161.457M118.123 -60.7897C105.889 -93.6944 95.4034 -126.739 86.935 -159.011M-53.4384 161.457C-20.7233 167.354 12.5748 174.986 45.5152 184.145M-53.4384 161.457C-53.2489 57.7258 23.5608 -41.7785 118.123 -60.7753C130.235 -28.2068 144.151 4.53329 159.492 36.4974M-53.4384 161.457C-53.6244 265.189 22.8853 333.865 117.451 314.851M-53.4384 161.457C-85.6278 155.61 -118.094 151.407 -150.711 148.865C-150.997 292.56 -44.9985 387.698 85.9979 361.362M45.5152 184.145C45.6404 115.231 96.6549 49.1286 159.492 36.4974M45.5152 184.145C78.4807 193.3 111.335 204.053 143.21 216.108M45.5152 184.145C45.3936 253.058 96.2188 298.683 159.042 286.066M159.492 36.4974C213.715 25.5936 259.004 58.0941 270.305 111.501M159.492 36.4974C174.831 68.4651 191.71 99.9284 209.67 130.015M273.974 153.51C273.974 144.08 272.096 119.98 270.305 111.511M-29.8893 61.9603C-0.00652037 79.8056 30.6344 98.6772 61.1609 118.042C91.691 137.415 122.365 157.441 152.333 177.564C182.588 197.888 209.312 216.367 237.833 236.676M102.048 65.0747C77.8373 37.5236 54.1521 9.64713 31.6577 -17.7716C8.94525 -45.4586 -12.7558 -72.9277 -32.8469 -99.4202M102.048 65.0747C126.263 92.6294 151.192 120.085 176.176 146.681C201.388 173.535 223.789 196.615 248.822 221.444M102.048 65.0747C126.263 92.6294 151.192 120.083 176.175 146.679M78.4056 193.822C78.5093 135.219 121.903 79.0081 175.321 68.2651M209.67 130.015C227.801 160.391 238.758 178.018 258.864 205.304M209.67 130.015C173.035 137.382 143.282 175.926 143.21 216.108M209.67 130.015C248.036 123.41 273.76 146.137 272.186 176.921C266.21 151.97 257.781 104.02 257.599 78.5466C258.865 53.4881 259.93 23.651 265.802 2.5085C271.576 -22.9891 280.201 -47.7562 291.512 -71.3257C303.36 -95.9444 317.853 -119.2 334.734 -140.683M175.328 68.2642C239.664 56.6987 280.111 115.735 273.971 172.332M274.157 172.136C274.246 123.131 236.764 90.5199 192.086 99.5034C147.412 108.487 111.125 155.507 111.039 204.501C110.949 253.505 153.331 285.755 198.005 276.776M141.555 288.101C147.431 287.904 153.28 287.218 159.043 286.052M159.043 286.052C168.187 284.213 188.957 280.823 197.48 276.879M159.043 286.052C143.636 292.632 129.642 302.334 117.451 314.851M159.043 286.052C96.2193 298.683 45.3939 253.058 45.5155 184.13C12.5751 174.971 -20.723 167.322 -53.4381 161.442C-53.6241 265.188 22.8853 333.865 117.451 314.851M197.48 276.879C144.055 287.607 78.2993 252.425 78.3923 193.821M197.48 276.879C175.375 292.864 157.332 295.411 157.332 295.411C85.887 313.078 25.1448 264.605 21.6616 187.141C18.1784 109.662 73.2734 32.5595 144.719 14.893C208.129 -0.78864 263.092 35.6353 277.107 98.1689C279.734 109.896 280.592 121.95 279.653 133.931C278.699 146.172 276.793 165.38 273.971 172.364M117.451 314.851C105.142 327.5 94.5629 343.145 85.9979 361.362M117.451 314.851C105.142 327.5 94.5594 343.145 85.9979 361.362M31.0754 306.582C53.4766 295.11 77.1757 286.373 101.663 280.558M-30.2278 251.552C-0.0903056 246.611 30.3937 244.085 60.9333 243.999C91.494 243.906 122.013 246.251 152.201 251.009C172.594 254.232 192.792 258.583 212.703 264.044M143.21 216.108C175.396 228.267 195.722 236.492 225.58 251.155M101.662 280.559C125.999 274.814 150.946 272.052 175.95 272.334M272.189 176.92C262.705 163.281 246.551 156.296 228.202 159.983C198.945 165.866 175.181 196.65 175.124 228.743M266.582 190.356C260.874 188.192 254.365 187.627 247.453 189.015C224.801 193.571 206.405 217.403 206.358 242.251C206.344 250.841 208.522 258.408 212.316 264.487M204.567 -52.5289C206.956 -9.4857 208.945 -0.262596 216.874 41.9903C223.319 73.017 232.096 103.513 243.13 133.219C250.175 152.167 258.171 170.746 267.09 188.887M201.616 273.793C185.752 266.951 175.095 250.293 175.134 228.732M-328.595 157.219C-302.242 151.923 -273.589 148.543 -243.42 147.181M-328.595 157.219C-328.173 -78.0596 -153.951 -303.75 60.5356 -346.876M-328.595 157.219C-328.173 -78.0596 -153.951 -303.751 60.5356 -346.872C60.4891 -317.97 62.7528 -287.15 67.2839 -255.321M-328.595 157.219C-329.017 392.501 -155.481 548.274 59.0051 505.152M-243.42 147.181C-243.084 -40.6811 -103.977 -220.886 67.2839 -255.321M-243.42 147.181C-243.76 335.042 -105.2 459.419 66.061 424.987M-243.42 147.181C-214.028 145.854 -182.84 146.415 -150.725 148.865M-243.42 147.181C-214.024 145.854 -182.84 146.415 -150.725 148.865M-243.42 147.181C-243.76 335.042 -105.2 459.419 66.0787 424.987M-243.42 147.181C-243.084 -40.6811 -103.973 -220.893 67.2839 -255.321M67.2839 -255.321C238.545 -289.757 377.101 -165.373 376.765 22.489M67.2839 -255.321C71.6969 -224.287 78.3056 -191.883 86.935 -159.011M67.2839 -255.321C238.541 -289.75 377.101 -165.373 376.765 22.489M67.2839 -255.321C238.541 -289.75 377.105 -165.373 376.765 22.489M376.765 22.489C376.429 210.351 237.318 390.556 66.0787 424.987M376.765 22.489C377.101 -165.373 238.541 -289.75 67.2833 -255.326C62.7522 -287.154 60.4819 -317.969 60.5356 -346.876M376.765 22.489C397.768 13.5484 421.782 6.35312 448.135 1.05318M376.765 22.489C397.768 13.5699 421.782 6.35312 448.135 1.05318M376.765 22.489C376.407 210.351 237.318 390.556 66.061 424.987M376.765 22.489C356.298 31.1863 338.424 41.6136 323.658 53.4866M376.765 22.489C376.425 210.351 237.318 390.556 66.061 424.987M376.765 22.489C376.425 210.351 237.322 390.556 66.061 424.987M66.0787 424.987C-105.161 459.419 -243.742 335.042 -243.403 147.181C-273.571 148.543 -302.224 151.923 -328.577 157.219C-328.999 392.501 -155.464 548.273 59.0228 505.152C273.509 462.03 447.71 236.335 448.135 1.05318M66.0787 424.987C70.5919 401.324 77.2968 379.927 86.0156 361.363C-44.9987 387.698 -150.997 292.56 -150.725 148.865M448.135 1.05318C448.561 -234.229 275.022 -390.001 60.5356 -346.876M448.135 1.05318C448.557 -234.225 275.022 -390.001 60.5356 -346.876M448.135 1.05318C447.71 236.335 273.499 462.026 59.0051 505.152M66.061 424.987C61.4298 449.274 59.0588 476.245 59.0051 505.152M66.061 424.987C70.5742 401.324 77.2791 379.912 85.9979 361.362M-150.725 148.865C-150.468 5.16565 -44.0686 -132.672 86.935 -159.011M-150.725 148.865C-150.997 292.56 -44.9987 387.713 85.9977 361.363C216.994 335.014 323.393 197.173 323.658 53.488C323.923 -90.1968 217.939 -185.35 86.935 -159.011M-150.725 148.865C-118.108 151.407 -85.6418 155.609 -53.4524 161.456C-53.2629 57.7249 23.5468 -41.7794 118.109 -60.7905C105.896 -93.6952 95.4034 -126.739 86.935 -159.011M86.935 -159.011C217.931 -185.35 323.923 -90.1982 323.658 53.4866M323.658 53.4866C323.401 197.182 216.994 335.013 85.9979 361.362M223.707 -240.347C215.439 -209.946 209.712 -178.909 206.584 -147.559M334.119 202.693C317.082 196.903 302.581 193.077 291.04 191.328M222.652 347.079C214.577 329.681 208.894 314.428 205.779 301.769M357.182 31.7504C357.489 -141.102 230.001 -255.548 72.423 -223.863C-85.1553 -192.184 -213.151 -26.3737 -213.459 146.482C-213.77 319.335 -86.2822 433.78 71.2962 402.095M339.44 42.1048C339.726 -115.996 223.107 -220.661 78.9854 -191.694C-65.1428 -162.716 -182.213 -11.0562 -182.496 147.044C-182.782 305.145 -66.1625 409.81 77.9586 380.842M357.181 31.7513C356.87 204.607 228.874 370.418 71.2955 402.096M339.439 42.1217C339.157 200.226 222.086 351.882 77.9579 380.86M206.585 -147.56C203.437 -115.982 202.738 -84.2082 204.496 -52.5226M291.04 191.317C279.707 189.601 271.102 189.865 265.463 192.1M205.779 301.755C202.718 289.32 202.089 279.25 203.916 271.818M-33.651 349.908C-13.8123 333.026 7.90768 318.488 31.0783 306.583M197.837 276.868C192.58 277.036 188.936 276.435 184.165 275.234C160.065 269.176 143.139 246.542 143.193 216.151C111.318 204.096 78.4632 193.342 45.512 184.187M289.102 92.6362C289.102 92.6362 274.315 112.005 273.971 172.35M280.436 114.219C280.562 27.2347 216.711 -27.9498 137.652 -11.9785C58.5932 3.99287 -5.59972 87.4508 -5.72489 174.442C-5.85006 261.422 70.1158 317.218 149.175 301.247M114.754 326.831C220.642 300.643 302.301 186.326 297.141 71.5293C291.977 -43.2669 201.949 -115.127 96.0576 -88.9385C-9.83738 -62.7536 -91.4965 51.5491 -86.3289 166.36M-86.3356 166.36C-81.1715 281.174 8.85946 353.016 114.751 326.831M176.762 289.003C163.818 296.177 149.992 301.631 135.635 305.224C48.9589 326.66 -24.7318 267.852 -28.9589 173.877C-33.1824 79.8977 33.6569 -13.6666 120.333 -35.0952C207.01 -56.531 280.701 2.27606 284.942 96.2516C284.942 96.2516 284.388 137.646 277.647 161.646M-301.505 152.566C-301.112 -66.7696 -138.699 -277.169 61.2541 -317.369C261.207 -357.572 422.984 -212.354 422.587 6.98216C422.193 226.318 259.78 436.713 59.8274 476.916C-140.125 517.116 -301.913 371.902 -301.505 152.566ZM-273.056 149.212C-272.699 -54.2741 -122.005 -249.488 63.5075 -286.788C249.02 -324.081 399.112 -189.355 398.747 14.1417C398.39 217.628 247.695 412.842 62.1834 450.139C-123.329 487.438 -273.421 352.709 -273.056 149.212ZM307.39 55.4183C313.112 182.402 222.78 308.821 105.663 337.785C-11.4576 366.748 -111.015 287.285 -116.737 160.301C-122.434 33.321 -32.1312 -93.0979 84.986 -122.065C202.107 -151.025 301.668 -71.5656 307.39 55.4183Z"
                  stroke="url(#paint0_linear_2178_104205)"
                  strokeMiterlimit="10"
                  strokeWidth="1.578512"
                ></path>
                <g style={{ mixBlendMode: "multiply" } as React.CSSProperties}>
                  <path
                    d="M196.602 276.9C229.861 250.886 256.536 214.42 272.06 173.512C278.14 117.53 234.278 55.4003 174.519 70.5884C122.307 83.8597 78.7806 136.795 78.6769 194.74C78.5732 252.685 143.792 287.525 196.602 276.9Z"
                    fill="url(#paint1_radial_2178_104205)"
                    style={{ mixBlendMode: "multiply" } as React.CSSProperties}
                  ></path>
                  <path
                    d="M271.493 173.376C256.018 214.116 229.458 250.433 196.354 276.359C170.138 281.593 140.844 275.57 118.108 261.046C95.342 246.502 79.204 223.473 79.2554 194.741C79.3586 137.065 122.7 84.3565 174.662 71.1491C204.289 63.619 229.98 75.2407 247.54 95.7376C265.097 116.231 274.491 145.567 271.493 173.376Z"
                    stroke="url(#paint2_linear_2178_104205)"
                    strokeOpacity="0.6"
                    strokeWidth="1.15702"
                  ></path>
                </g>
                <g style={{ mixBlendMode: "multiply" } as React.CSSProperties}>
                  <path
                    d="M197.759 269.958C231.018 243.944 257.693 207.478 273.217 166.57C279.297 110.588 235.435 48.4582 175.676 63.6463C123.464 76.9176 79.9378 129.853 79.8341 187.798C79.7304 245.743 144.95 280.582 197.759 269.958Z"
                    fill="url(#paint3_radial_2178_104205)"
                    style={{ mixBlendMode: "multiply" } as React.CSSProperties}
                  ></path>
                  <path
                    d="M272.65 166.434C257.175 207.174 230.615 243.491 197.511 269.417C171.295 274.651 142.001 268.628 119.266 254.104C96.4993 239.56 80.3612 216.53 80.4126 187.799C80.5158 130.123 123.858 77.4144 175.819 64.207C205.446 56.6769 231.137 68.2986 248.697 88.7955C266.254 109.289 275.648 138.625 272.65 166.434Z"
                    stroke="url(#paint4_linear_2178_104205)"
                    strokeOpacity="0.6"
                    strokeWidth="1.15702"
                  ></path>
                </g>
                <rect
                  fill="url(#paint5_radial_2178_104205)"
                  fillOpacity="0.8"
                  height="281.157"
                  width="280"
                  x="-0.000976562"
                  y="-1.15625"
                ></rect>
                <path
                  d="M201.322 271.322L270.744 173.554L281.735 161.983L280.578 282.314L186.859 281.157L201.322 271.322Z"
                  fill="url(#paint6_linear_2178_104205)"
                ></path>
              </g>
              <defs>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint0_linear_2178_104205"
                  x1="225.041"
                  x2="-13.693"
                  y1="210.579"
                  y2="139.133"
                >
                  <stop stopColor="#525252"></stop>
                  <stop offset="1" stopColor="#0A0A0A"></stop>
                  <stop offset="1" stopColor="#0A0A0A"></stop>
                </linearGradient>
                <radialGradient
                  cx="0"
                  cy="0"
                  gradientTransform="translate(242.536 235.45) rotate(-176.76) scale(165.751 170.839)"
                  gradientUnits="userSpaceOnUse"
                  id="paint1_radial_2178_104205"
                  r="1"
                >
                  <stop offset="0.26"></stop>
                  <stop offset="0.29" stopColor="#0E0E0E"></stop>
                  <stop offset="0.49" stopColor="#636363"></stop>
                  <stop offset="0.67" stopColor="#A6A6A6"></stop>
                  <stop offset="0.82" stopColor="#D6D6D6"></stop>
                  <stop offset="0.94" stopColor="#F4F4F4"></stop>
                  <stop offset="1" stopColor="white"></stop>
                </radialGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint2_linear_2178_104205"
                  x1="216.917"
                  x2="157.579"
                  y1="205.473"
                  y2="187.226"
                >
                  <stop stopColor="#525252"></stop>
                  <stop offset="1" stopColor="#0A0A0A"></stop>
                  <stop offset="1" stopColor="#0A0A0A"></stop>
                </linearGradient>
                <radialGradient
                  cx="0"
                  cy="0"
                  gradientTransform="translate(243.694 228.508) rotate(-176.76) scale(165.751 170.839)"
                  gradientUnits="userSpaceOnUse"
                  id="paint3_radial_2178_104205"
                  r="1"
                >
                  <stop></stop>
                  <stop offset="0.03" stopColor="#181818"></stop>
                  <stop offset="0.1" stopColor="#484848"></stop>
                  <stop offset="0.17" stopColor="#737373"></stop>
                  <stop offset="0.25" stopColor="#999999"></stop>
                  <stop offset="0.33" stopColor="#B9B9B9"></stop>
                  <stop offset="0.42" stopColor="#D3D3D3"></stop>
                  <stop offset="0.51" stopColor="#E6E6E6"></stop>
                  <stop offset="0.62" stopColor="#F4F4F4"></stop>
                  <stop offset="0.76" stopColor="#FDFDFD"></stop>
                  <stop offset="1" stopColor="white"></stop>
                </radialGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint4_linear_2178_104205"
                  x1="218.074"
                  x2="158.736"
                  y1="198.531"
                  y2="180.284"
                >
                  <stop stopColor="#525252"></stop>
                  <stop offset="1" stopColor="#0A0A0A"></stop>
                  <stop offset="1" stopColor="#0A0A0A"></stop>
                </linearGradient>
                <radialGradient
                  cx="0"
                  cy="0"
                  gradientTransform="translate(208.263 201.902) rotate(-135.725) scale(290.872 289.675)"
                  gradientUnits="userSpaceOnUse"
                  id="paint5_radial_2178_104205"
                  r="1"
                >
                  <stop stopColor="#0A0A0A" stopOpacity="0"></stop>
                  <stop
                    offset="0.42417"
                    stopColor="#0A0A0A"
                    stopOpacity="0.8"
                  ></stop>
                  <stop offset="1" stopColor="#0A0A0A"></stop>
                </radialGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint6_linear_2178_104205"
                  x1="238.925"
                  x2="280"
                  y1="227.934"
                  y2="278.843"
                >
                  <stop stopColor="#0A0A0A" stopOpacity="0"></stop>
                  <stop offset="0.368893" stopColor="#0A0A0A"></stop>
                </linearGradient>
                <clipPath id="clip0_2178_104205">
                  <rect fill="white" height="280" width="280"></rect>
                </clipPath>
              </defs>
            </svg>
            <div className="absolute inset-0 transition-all duration-700 ease-in-out delay-200 origin-center group-hover:scale-[0.6] group-hover:rotate-[360deg] group-hover:translate-[12%]">
              {/* PostgreSQL */}
              <div
                className="isolate before:transition-opacity flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-[20px] size-14 absolute translate-x-[-50%] translate-y-[-50%] left-[70%] top-[50%] rotate-[-16deg] gradient-border gb-width-[1.5px] gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-[1.5px] border-transparent"
                style={
                  {
                    boxShadow:
                      "inset 0 0 15px rgba(255, 255, 255, 0.14), 0 -27px 40px rgba(255, 255, 255, 0.03)",
                  } as React.CSSProperties
                }
                title="PostgreSQL"
              >
                <BiLogoPostgresql className="size-[58%] text-neutral-200 hover:text-white transition-colors" />
              </div>

              {/* TypeScript */}
              <div
                className="isolate before:transition-opacity flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-[20px] size-14 absolute translate-x-[-50%] translate-y-[-50%] left-[45%] top-[65%] rotate-[-16deg] gradient-border gb-width-[1.5px] gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-[1.5px] border-transparent"
                style={
                  {
                    transition: "transform 0.7s ease-in-out",
                    boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.14)",
                  } as React.CSSProperties
                }
                title="TypeScript"
              >
                <SiTypescript className="size-[50%] text-neutral-100 hover:text-white transition-colors" />
              </div>

              {/* Go */}
              <div
                className="isolate before:transition-opacity flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-[20px] size-14 absolute translate-x-[-50%] translate-y-[-50%] left-[46%] top-[36%] rotate-[16deg] gradient-border gb-width-[1.5px] gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-[1.5px] border-transparent"
                style={
                  {
                    transition: "transform 0.7s ease-in-out",
                    boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.14)",
                  } as React.CSSProperties
                }
                title="Go"
              >
                <FaGolang className="size-[60%] text-neutral-100 hover:text-white transition-colors" />
              </div>
              {/* Tailwind */}
              <div
                className="isolate before:transition-opacity flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-[11px] size-7 absolute translate-x-[-50%] translate-y-[-50%] left-[29%] top-[48%] rotate-[-33deg] gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
                style={
                  {
                    transition: "transform 0.7s ease-in-out",
                    boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.14)",
                  } as React.CSSProperties
                }
                title="Tailwind Css"
              >
                <SiTailwindcss className="size-[58%] text-neutral-200 hover:text-white transition-colors" />
              </div>

              {/* Next.js */}
              <div
                className="isolate before:transition-opacity flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-[11px] size-8 absolute translate-x-[-50%] translate-y-[-50%] left-[64%] top-[68%] rotate-[20deg] gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
                style={
                  {
                    transition: "transform 0.7s ease-in-out",
                    boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.14)",
                  } as React.CSSProperties
                }
                title="Next.js"
              >
                <SiNextdotjs className="size-[58%] text-neutral-100 hover:text-white transition-colors" />
              </div>
              <div
                className="isolate before:transition-opacity opacity-60 absolute rounded-[3.5px] size-2 translate-x-[-50%] translate-y-[-50%] left-[40%] top-[50%] gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
                style={
                  {
                    boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.1)",
                  } as React.CSSProperties
                }
              ></div>
              <div
                className="isolate before:transition-opacity opacity-60 absolute rounded-[3.5px] size-2 translate-x-[-50%] translate-y-[-50%] left-[58%] top-[23%] gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
                style={
                  {
                    boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.1)",
                  } as React.CSSProperties
                }
              ></div>
              <div
                className="isolate before:transition-opacity opacity-60 absolute rounded-[3.5px] size-2 translate-x-[-50%] translate-y-[-50%] left-[78%] top-[63%] gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
                style={
                  {
                    boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.1)",
                  } as React.CSSProperties
                }
              ></div>
              <div
                className="isolate before:transition-opacity opacity-60 absolute rounded-[3.5px] size-2 translate-x-[-50%] translate-y-[-50%] left-[55%] top-[77%] gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
                style={
                  {
                    boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.1)",
                  } as React.CSSProperties
                }
              ></div>
              {/* Redis */}
              <div
                className="isolate before:transition-opacity flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-[11px] size-7 absolute translate-x-[-50%] translate-y-[-50%] left-[68%] top-[28%] rotate-[-21deg] gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
                style={
                  {
                    transition: "transform 0.7s ease-in-out",
                    boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.14)",
                  } as React.CSSProperties
                }
                title="Redis"
              >
                <SiRedis className="size-[58%] text-neutral-200 hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-8 mt-8">
          <div className="group border border-neutral-800 rounded-xl size-72 relative shrink-0 pointer-events-auto cursor-pointer">
            <div className="hero-illustration-card absolute bg-neutral-950 inset-[-1px] border border-neutral-800 rounded-xl group-hover:-translate-[15px] transition-all duration-300 ease-in-out  pointer-events-none">
              <svg
                className="absolute inset-0 rounded-xl"
                fill="none"
                height="285"
                viewBox="0 0 285 285"
                width="285"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_2180_104240)">
                  <g opacity="0.1">
                    <mask fill="white" id="path-1-inside-1_2180_104240">
                      <path d="M200.288 107.086C200.288 97.7277 207.874 90.1409 217.233 90.1409H232.767C242.125 90.1409 249.712 97.7277 249.712 107.086V177.693C249.712 187.052 242.125 194.639 232.767 194.639H217.233C207.874 194.639 200.288 187.052 200.288 177.693V107.086Z"></path>
                      <path d="M200.288 52.0133C200.288 42.6545 207.874 35.0677 217.233 35.0677H232.767C242.125 35.0677 249.712 42.6545 249.712 52.0133V67.5468C249.712 76.9056 242.125 84.4923 232.767 84.4923H217.233C207.874 84.4923 200.288 76.9056 200.288 67.5468V52.0133Z"></path>
                      <path d="M255.361 162.16C255.361 152.801 262.948 145.214 272.306 145.214H287.84C297.199 145.214 304.785 152.801 304.785 162.16V177.693C304.785 187.052 297.199 194.639 287.84 194.639H272.306C262.948 194.639 255.361 187.052 255.361 177.693V162.16Z"></path>
                      <path d="M255.361 -3.0598C255.361 -12.4186 262.948 -20.0054 272.306 -20.0054L287.84 -20.0054C297.199 -20.0054 304.785 -12.4186 304.785 -3.0598V12.4736C304.785 21.8324 297.199 29.4192 287.84 29.4192H272.306C262.948 29.4192 255.361 21.8324 255.361 12.4736V-3.0598Z"></path>
                      <path d="M90.1414 -3.0598C90.1414 -12.4186 97.7282 -20.0054 107.087 -20.0054L122.62 -20.0054C131.979 -20.0054 139.566 -12.4186 139.566 -3.0598V12.4736C139.566 21.8324 131.979 29.4192 122.62 29.4192H107.087C97.7282 29.4192 90.1414 21.8324 90.1414 12.4736V-3.0598Z"></path>
                      <path d="M-20.0049 52.0133C-20.0049 42.6545 -12.4181 35.0677 -3.05931 35.0677L12.4741 35.0677C21.8329 35.0677 29.4197 42.6545 29.4197 52.0133V67.5468C29.4197 76.9056 21.8329 84.4923 12.4741 84.4923H-3.05931C-12.4181 84.4923 -20.0049 76.9056 -20.0049 67.5468V52.0133Z"></path>
                      <path d="M-20.0049 107.086C-20.0049 97.7277 -12.4181 90.1409 -3.05931 90.1409H12.4741C21.8329 90.1409 29.4197 97.7277 29.4197 107.086V122.62C29.4197 131.979 21.8329 139.565 12.4741 139.565H-3.05931C-12.4181 139.565 -20.0049 131.979 -20.0049 122.62V107.086Z"></path>
                      <path d="M35.0682 217.233C35.0682 207.874 42.655 200.287 52.0138 200.287H67.5473C76.906 200.287 84.4928 207.874 84.4928 217.233V232.766C84.4928 242.125 76.906 249.712 67.5473 249.712H52.0138C42.655 249.712 35.0682 242.125 35.0682 232.766V217.233Z"></path>
                      <path d="M90.1414 217.233C90.1414 207.874 97.7282 200.287 107.087 200.287H122.62C131.979 200.287 139.566 207.874 139.566 217.233V232.766C139.566 242.125 131.979 249.712 122.62 249.712H107.087C97.7282 249.712 90.1414 242.125 90.1414 232.766V217.233Z"></path>
                      <path d="M200.288 272.306C200.288 262.947 207.874 255.36 217.233 255.36H232.767C242.125 255.36 249.712 262.947 249.712 272.306V287.839C249.712 297.198 242.125 304.785 232.767 304.785H217.233C207.874 304.785 200.288 297.198 200.288 287.839V272.306Z"></path>
                      <path d="M255.361 272.306C255.361 262.947 262.948 255.36 272.306 255.36H287.84C297.199 255.36 304.785 262.947 304.785 272.306V287.839C304.785 297.198 297.199 304.785 287.84 304.785H272.306C262.948 304.785 255.361 297.198 255.361 287.839V272.306Z"></path>
                      <path d="M35.0682 52.0133C35.0682 42.6545 42.655 35.0677 52.0138 35.0677L67.5473 35.0677C76.906 35.0677 84.4928 42.6545 84.4928 52.0133V122.62C84.4928 131.979 76.906 139.565 67.5473 139.565H52.0138C42.655 139.565 35.0682 131.979 35.0682 122.62V52.0133Z"></path>
                      <path d="M145.214 217.233C145.214 207.874 152.801 200.287 162.16 200.287H177.693C187.052 200.287 194.639 207.874 194.639 217.233V287.839C194.639 297.198 187.052 304.785 177.693 304.785H162.16C152.801 304.785 145.214 297.198 145.214 287.839V217.233Z"></path>
                      <path d="M-20.0049 217.233C-20.0049 207.874 -12.4181 200.287 -3.05931 200.287H12.4741C21.8329 200.287 29.4197 207.874 29.4197 217.233V287.839C29.4197 297.198 21.8329 304.785 12.4741 304.785H-3.05931C-12.4181 304.785 -20.0049 297.198 -20.0049 287.839V217.233Z"></path>
                      <path d="M255.361 50.6012C255.361 41.2424 262.948 33.6556 272.306 33.6556H287.84C297.199 33.6556 304.785 41.2424 304.785 50.6012V121.208C304.785 130.567 297.199 138.153 287.84 138.153H272.306C262.948 138.153 255.361 130.567 255.361 121.208V50.6012Z"></path>
                      <path d="M162.16 29.4192C152.801 29.4192 145.214 21.8324 145.214 12.4736V-3.0598C145.214 -12.4186 152.801 -20.0054 162.16 -20.0054L232.767 -20.0054C242.125 -20.0054 249.712 -12.4186 249.712 -3.0598V12.4736C249.712 21.8324 242.125 29.4192 232.767 29.4192L162.16 29.4192Z"></path>
                      <path d="M-3.05931 29.4192C-12.4181 29.4192 -20.0049 21.8324 -20.0049 12.4736V-3.0598C-20.0049 -12.4186 -12.4181 -20.0054 -3.05931 -20.0054L67.5473 -20.0054C76.906 -20.0054 84.4928 -12.4186 84.4928 -3.0598V12.4736C84.4928 21.8324 76.906 29.4192 67.5473 29.4192L-3.05931 29.4192Z"></path>
                      <path d="M-3.05931 194.639C-12.4181 194.639 -20.0049 187.052 -20.0049 177.693V162.16C-20.0049 152.801 -12.4181 145.214 -3.05931 145.214H67.5473C76.906 145.214 84.4928 152.801 84.4928 162.16V177.693C84.4928 187.052 76.906 194.639 67.5473 194.639H-3.05931Z"></path>
                      <path d="M107.087 84.4923C97.7282 84.4923 90.1414 76.9056 90.1414 67.5468V52.0133C90.1414 42.6545 97.7282 35.0677 107.087 35.0677L177.693 35.0677C187.052 35.0677 194.639 42.6545 194.639 52.0133V67.5468C194.639 76.9056 187.052 84.4923 177.693 84.4923L107.087 84.4923Z"></path>
                      <path d="M52.0138 304.785C42.655 304.785 35.0682 297.198 35.0682 287.839V272.306C35.0682 262.947 42.655 255.36 52.0138 255.36H122.62C131.979 255.36 139.566 262.947 139.566 272.306V287.839C139.566 297.198 131.979 304.785 122.62 304.785H52.0138Z"></path>
                      <path d="M217.233 249.712C207.874 249.712 200.288 242.125 200.288 232.766V217.233C200.288 207.874 207.874 200.287 217.233 200.287H287.84C297.199 200.287 304.785 207.874 304.785 217.233V232.766C304.785 242.125 297.199 249.712 287.84 249.712H217.233Z"></path>
                      <path d="M-3.05931 194.639C-12.4181 194.639 -20.0049 187.052 -20.0049 177.693V162.16C-20.0049 152.801 -12.4181 145.214 -3.05931 145.214H67.5473C76.906 145.214 84.4928 152.801 84.4928 162.16V177.693C84.4928 187.052 76.906 194.639 67.5473 194.639H-3.05931Z"></path>
                    </mask>
                    <path
                      d="M200.288 107.086C200.288 97.7277 207.874 90.1409 217.233 90.1409H232.767C242.125 90.1409 249.712 97.7277 249.712 107.086V177.693C249.712 187.052 242.125 194.639 232.767 194.639H217.233C207.874 194.639 200.288 187.052 200.288 177.693V107.086Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint0_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M200.288 52.0133C200.288 42.6545 207.874 35.0677 217.233 35.0677H232.767C242.125 35.0677 249.712 42.6545 249.712 52.0133V67.5468C249.712 76.9056 242.125 84.4923 232.767 84.4923H217.233C207.874 84.4923 200.288 76.9056 200.288 67.5468V52.0133Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint1_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M255.361 162.16C255.361 152.801 262.948 145.214 272.306 145.214H287.84C297.199 145.214 304.785 152.801 304.785 162.16V177.693C304.785 187.052 297.199 194.639 287.84 194.639H272.306C262.948 194.639 255.361 187.052 255.361 177.693V162.16Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint2_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M255.361 -3.0598C255.361 -12.4186 262.948 -20.0054 272.306 -20.0054L287.84 -20.0054C297.199 -20.0054 304.785 -12.4186 304.785 -3.0598V12.4736C304.785 21.8324 297.199 29.4192 287.84 29.4192H272.306C262.948 29.4192 255.361 21.8324 255.361 12.4736V-3.0598Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint3_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M90.1414 -3.0598C90.1414 -12.4186 97.7282 -20.0054 107.087 -20.0054L122.62 -20.0054C131.979 -20.0054 139.566 -12.4186 139.566 -3.0598V12.4736C139.566 21.8324 131.979 29.4192 122.62 29.4192H107.087C97.7282 29.4192 90.1414 21.8324 90.1414 12.4736V-3.0598Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint4_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M-20.0049 52.0133C-20.0049 42.6545 -12.4181 35.0677 -3.05931 35.0677L12.4741 35.0677C21.8329 35.0677 29.4197 42.6545 29.4197 52.0133V67.5468C29.4197 76.9056 21.8329 84.4923 12.4741 84.4923H-3.05931C-12.4181 84.4923 -20.0049 76.9056 -20.0049 67.5468V52.0133Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint5_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M-20.0049 107.086C-20.0049 97.7277 -12.4181 90.1409 -3.05931 90.1409H12.4741C21.8329 90.1409 29.4197 97.7277 29.4197 107.086V122.62C29.4197 131.979 21.8329 139.565 12.4741 139.565H-3.05931C-12.4181 139.565 -20.0049 131.979 -20.0049 122.62V107.086Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint6_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M35.0682 217.233C35.0682 207.874 42.655 200.287 52.0138 200.287H67.5473C76.906 200.287 84.4928 207.874 84.4928 217.233V232.766C84.4928 242.125 76.906 249.712 67.5473 249.712H52.0138C42.655 249.712 35.0682 242.125 35.0682 232.766V217.233Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint7_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M90.1414 217.233C90.1414 207.874 97.7282 200.287 107.087 200.287H122.62C131.979 200.287 139.566 207.874 139.566 217.233V232.766C139.566 242.125 131.979 249.712 122.62 249.712H107.087C97.7282 249.712 90.1414 242.125 90.1414 232.766V217.233Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint8_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M200.288 272.306C200.288 262.947 207.874 255.36 217.233 255.36H232.767C242.125 255.36 249.712 262.947 249.712 272.306V287.839C249.712 297.198 242.125 304.785 232.767 304.785H217.233C207.874 304.785 200.288 297.198 200.288 287.839V272.306Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint9_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M255.361 272.306C255.361 262.947 262.948 255.36 272.306 255.36H287.84C297.199 255.36 304.785 262.947 304.785 272.306V287.839C304.785 297.198 297.199 304.785 287.84 304.785H272.306C262.948 304.785 255.361 297.198 255.361 287.839V272.306Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint10_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M35.0682 52.0133C35.0682 42.6545 42.655 35.0677 52.0138 35.0677L67.5473 35.0677C76.906 35.0677 84.4928 42.6545 84.4928 52.0133V122.62C84.4928 131.979 76.906 139.565 67.5473 139.565H52.0138C42.655 139.565 35.0682 131.979 35.0682 122.62V52.0133Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint11_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M145.214 217.233C145.214 207.874 152.801 200.287 162.16 200.287H177.693C187.052 200.287 194.639 207.874 194.639 217.233V287.839C194.639 297.198 187.052 304.785 177.693 304.785H162.16C152.801 304.785 145.214 297.198 145.214 287.839V217.233Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint12_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M-20.0049 217.233C-20.0049 207.874 -12.4181 200.287 -3.05931 200.287H12.4741C21.8329 200.287 29.4197 207.874 29.4197 217.233V287.839C29.4197 297.198 21.8329 304.785 12.4741 304.785H-3.05931C-12.4181 304.785 -20.0049 297.198 -20.0049 287.839V217.233Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint13_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M255.361 50.6012C255.361 41.2424 262.948 33.6556 272.306 33.6556H287.84C297.199 33.6556 304.785 41.2424 304.785 50.6012V121.208C304.785 130.567 297.199 138.153 287.84 138.153H272.306C262.948 138.153 255.361 130.567 255.361 121.208V50.6012Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint14_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M162.16 29.4192C152.801 29.4192 145.214 21.8324 145.214 12.4736V-3.0598C145.214 -12.4186 152.801 -20.0054 162.16 -20.0054L232.767 -20.0054C242.125 -20.0054 249.712 -12.4186 249.712 -3.0598V12.4736C249.712 21.8324 242.125 29.4192 232.767 29.4192L162.16 29.4192Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint15_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M-3.05931 29.4192C-12.4181 29.4192 -20.0049 21.8324 -20.0049 12.4736V-3.0598C-20.0049 -12.4186 -12.4181 -20.0054 -3.05931 -20.0054L67.5473 -20.0054C76.906 -20.0054 84.4928 -12.4186 84.4928 -3.0598V12.4736C84.4928 21.8324 76.906 29.4192 67.5473 29.4192L-3.05931 29.4192Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint16_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M-3.05931 194.639C-12.4181 194.639 -20.0049 187.052 -20.0049 177.693V162.16C-20.0049 152.801 -12.4181 145.214 -3.05931 145.214H67.5473C76.906 145.214 84.4928 152.801 84.4928 162.16V177.693C84.4928 187.052 76.906 194.639 67.5473 194.639H-3.05931Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint17_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M107.087 84.4923C97.7282 84.4923 90.1414 76.9056 90.1414 67.5468V52.0133C90.1414 42.6545 97.7282 35.0677 107.087 35.0677L177.693 35.0677C187.052 35.0677 194.639 42.6545 194.639 52.0133V67.5468C194.639 76.9056 187.052 84.4923 177.693 84.4923L107.087 84.4923Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint18_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M52.0138 304.785C42.655 304.785 35.0682 297.198 35.0682 287.839V272.306C35.0682 262.947 42.655 255.36 52.0138 255.36H122.62C131.979 255.36 139.566 262.947 139.566 272.306V287.839C139.566 297.198 131.979 304.785 122.62 304.785H52.0138Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint19_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M217.233 249.712C207.874 249.712 200.288 242.125 200.288 232.766V217.233C200.288 207.874 207.874 200.287 217.233 200.287H287.84C297.199 200.287 304.785 207.874 304.785 217.233V232.766C304.785 242.125 297.199 249.712 287.84 249.712H217.233Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint20_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                    <path
                      d="M-3.05931 194.639C-12.4181 194.639 -20.0049 187.052 -20.0049 177.693V162.16C-20.0049 152.801 -12.4181 145.214 -3.05931 145.214H67.5473C76.906 145.214 84.4928 152.801 84.4928 162.16V177.693C84.4928 187.052 76.906 194.639 67.5473 194.639H-3.05931Z"
                      mask="url(#path-1-inside-1_2180_104240)"
                      stroke="url(#paint21_radial_2180_104240)"
                      strokeWidth="2.82426"
                    ></path>
                  </g>
                  <path
                    className="transition-[stroke-dashoffset] [transition-duration:500ms] group-hover:[transition-delay:calc(400ms+200ms)] group-hover:[stroke-dashoffset:40]"
                    d="M114.5 200V183.191C114.333 181.024 113 176.062 109.5 173C105.37 169.386 102.5 169 98 169C94.4 169 87.5 169 84.5 169"
                    stroke="#fff"
                    strokeDasharray="100"
                    strokeDashoffset="100"
                    strokeOpacity="0.2"
                    style={
                      {
                        transitionTimingFunction: "ease-in-out",
                      } as React.CSSProperties
                    }
                  ></path>
                  <path
                    className="transition-[stroke-dashoffset] [transition-duration:900ms] group-hover:[stroke-dashoffset:0] group-hover:[transition-delay:calc(200ms)]"
                    d="M84.5 167H208C210.5 167.167 215.5 167 220 164C224.5 161 226 155.5 226 149.5C226 145.9 226 105.667 226 86"
                    stroke="#fff"
                    strokeDasharray="300"
                    strokeDashoffset="-220"
                    strokeOpacity="0.2"
                    style={
                      {
                        transitionTimingFunction: "ease-out",
                      } as React.CSSProperties
                    }
                  ></path>
                  <g
                    className="transition [transition-duration:200ms] group-hover:opacity-100 origin-top-left opacity-0 group-hover:[transition-delay:calc(800ms+200ms)]"
                    style={
                      {
                        transitionTimingFunction: "ease-out",
                      } as React.CSSProperties
                    }
                  >
                    <rect
                      fill="#D9D9D9"
                      height="4.7071"
                      rx="2.35355"
                      width="4.7071"
                      x="95.0566"
                      y="165.436"
                    ></rect>
                    <rect
                      height="7.06066"
                      rx="3.53033"
                      stroke="#D9D9D9"
                      strokeOpacity="0.12"
                      strokeWidth="2.35355"
                      width="7.06066"
                      x="93.8799"
                      y="164.259"
                    ></rect>
                  </g>
                </g>
                <defs>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint0_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint1_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint2_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint3_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint4_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint5_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint6_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint7_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint8_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint9_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint10_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint11_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint12_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint13_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint14_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint15_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint16_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint17_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint18_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint19_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint20_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(144.512 143.545) rotate(45) scale(229.661 452.292)"
                    gradientUnits="userSpaceOnUse"
                    id="paint21_radial_2180_104240"
                    r="1"
                  >
                    <stop stopColor="white"></stop>
                    <stop
                      offset="0.465"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                  </radialGradient>
                  <clipPath id="clip0_2180_104240">
                    <rect fill="white" height="284.78" width="284.78"></rect>
                  </clipPath>
                </defs>
              </svg>
              <div className="absolute inset-0">
                <div
                  className="isolate before:transition-opacity absolute rounded-[20px] left-[10%] top-[22%] p-0.5 animate-floating gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
                  style={
                    {
                      boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.18)",
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="px-4 py-0.5 rounded-[20px]"
                    style={
                      {
                        boxShadow:
                          "inset 0 0 15px rgba(255, 255, 255, 0.18), 0 23px 41px rgba(0,0,0,0.41)",
                      } as React.CSSProperties
                    }
                  >
                    hello world!
                  </div>
                </div>
                <div
                  className="isolate before:transition-opacity absolute rounded-[17px] size-[49px] translate-x-[-50%] translate-y-[-50%] left-[78.6%] top-[21%] gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
                  style={
                    {
                      boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.18)",
                    } as React.CSSProperties
                  }
                ></div>
                <div
                  className="isolate before:transition-opacity absolute rounded-[17px] size-[49px] translate-x-[-50%] translate-y-[-50%] left-[21%] top-[59.5%] gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
                  style={
                    {
                      boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.18)",
                    } as React.CSSProperties
                  }
                ></div>
                <div
                  className="isolate before:transition-opacity absolute rounded-[17px] size-[49px] translate-x-[-50%] translate-y-[-50%] left-[40%] top-[78.5%] gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
                  style={
                    {
                      boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.18)",
                    } as React.CSSProperties
                  }
                ></div>
              </div>
            </div>
          </div>
          <div
            className="hero-illustration-card group border border-neutral-800 rounded-xl size-72 relative shrink-0 pointer-events-auto cursor-pointer"
            id="hero-wireframe-card"
          >
            <div className="absolute bg-neutral-950 inset-[-1px] border border-neutral-800 rounded-xl group-hover:-translate-[15px] transition-all duration-300 ease-in-out  pointer-events-none">
              <svg
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl"
                fill="none"
                height="280"
                viewBox="0 0 280 280"
                width="280"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_2181_104267)">
                  <path
                    d="M36.4467 94.1819C36.4467 85.2997 43.6471 78.0993 52.5293 78.0993H227.471C236.354 78.0993 243.554 85.2997 243.554 94.1819V109.455C243.554 118.337 236.354 125.537 227.471 125.537H52.5293C43.6471 125.537 36.4467 118.337 36.4467 109.455V94.1819ZM249.339 94.1819C249.339 85.2997 256.54 78.0993 265.422 78.0993H280.695C289.577 78.0993 296.777 85.2997 296.777 94.1819V109.455C296.777 118.337 289.577 125.537 280.695 125.537H265.422C256.54 125.537 249.339 118.337 249.339 109.455V94.1819ZM36.4467 147.405C36.4467 138.523 43.6471 131.322 52.5293 131.322H121.025C129.907 131.322 137.108 138.523 137.108 147.405V215.901C137.108 224.783 129.907 231.984 121.025 231.984H52.5293C43.6471 231.984 36.4467 224.783 36.4467 215.901V147.405ZM142.893 147.405C142.893 138.523 150.093 131.322 158.976 131.322H174.248C183.131 131.322 190.331 138.523 190.331 147.405V162.678C190.331 171.56 183.131 178.76 174.248 178.76H158.976C150.093 178.76 142.893 171.56 142.893 162.678V147.405ZM196.116 147.405C196.116 138.523 203.317 131.322 212.199 131.322H227.471C236.354 131.322 243.554 138.523 243.554 147.405V162.678C243.554 171.56 236.354 178.76 227.471 178.76H212.199C203.317 178.76 196.116 171.56 196.116 162.678V147.405ZM142.893 200.628C142.893 191.746 150.093 184.546 158.976 184.546H174.248C183.131 184.546 190.331 191.746 190.331 200.628V215.901C190.331 224.783 183.131 231.984 174.248 231.984H158.976C150.093 231.984 142.893 224.783 142.893 215.901V200.628ZM196.116 200.628C196.116 191.746 203.317 184.546 212.199 184.546H227.471C236.354 184.546 243.554 191.746 243.554 200.628V215.901C243.554 224.783 236.354 231.984 227.471 231.984H212.199C203.317 231.984 196.116 224.783 196.116 215.901V200.628ZM249.339 147.405C249.339 138.523 256.54 131.322 265.422 131.322H280.695C289.577 131.322 296.777 138.523 296.777 147.405V215.901C296.777 224.783 289.577 231.984 280.695 231.984H265.422C256.54 231.984 249.339 224.783 249.339 215.901V147.405ZM36.4467 253.851C36.4467 244.969 43.6471 237.769 52.5293 237.769H67.8021C76.6842 237.769 83.8847 244.969 83.8847 253.851V269.124C83.8847 278.006 76.6842 285.207 67.8021 285.207H52.5293C43.6471 285.207 36.4467 278.006 36.4467 269.124V253.851ZM105.752 285.207C96.8703 285.207 89.6698 278.006 89.6698 269.124V253.851C89.6698 244.969 96.8703 237.769 105.752 237.769H225.157C234.04 237.769 241.24 244.969 241.24 253.851V269.124C241.24 278.006 234.04 285.207 225.157 285.207H105.752ZM247.025 253.851C247.025 244.969 254.226 237.769 263.108 237.769H278.381C287.263 237.769 294.463 244.969 294.463 253.851V269.124C294.463 278.006 287.263 285.207 278.381 285.207H263.108C254.226 285.207 247.025 278.006 247.025 269.124V253.851Z"
                    opacity="0.1"
                    stroke="url(#paint0_diamond_2181_104267)"
                    strokeWidth="1.15702"
                  ></path>
                  <rect
                    fill="url(#paint1_linear_2181_104267)"
                    height="40.4959"
                    width="238.347"
                    x="18.5127"
                    y="239.504"
                  ></rect>
                  <path
                    d="M52.0664 160.248C52.0664 159.928 52.3254 159.669 52.6449 159.669H119.752C120.072 159.669 120.331 159.928 120.331 160.248V161.405C120.331 161.724 120.072 161.983 119.752 161.983H52.6449C52.3254 161.983 52.0664 161.724 52.0664 161.405V160.248Z"
                    fill="url(#paint2_linear_2181_104267)"
                    fillOpacity="0.1"
                  ></path>
                  <path
                    d="M52.0664 171.818C52.0664 171.499 52.3254 171.24 52.6449 171.24H110.496C110.816 171.24 111.075 171.499 111.075 171.818V172.975C111.075 173.295 110.816 173.554 110.496 173.554H52.6449C52.3254 173.554 52.0664 173.295 52.0664 172.975V171.818Z"
                    fill="url(#paint3_linear_2181_104267)"
                    fillOpacity="0.1"
                  ></path>
                  <path
                    d="M52.0664 99.5041C52.0664 96.948 54.1385 94.876 56.6945 94.876H105.29C107.846 94.876 109.918 96.948 109.918 99.5041V104.132C109.918 106.688 107.846 108.76 105.29 108.76H56.6945C54.1385 108.76 52.0664 106.688 52.0664 104.132V99.5041Z"
                    fill="url(#paint4_linear_2181_104267)"
                    fillOpacity="0.1"
                  ></path>
                  <path
                    d="M123.802 101.24C123.802 100.92 124.061 100.661 124.38 100.661H167.19C167.51 100.661 167.769 100.92 167.769 101.24V102.397C167.769 102.716 167.51 102.975 167.19 102.975H124.38C124.061 102.975 123.802 102.716 123.802 102.397V101.24Z"
                    fill="url(#paint5_linear_2181_104267)"
                    fillOpacity="0.1"
                  ></path>
                  <path
                    d="M181.653 101.24C181.653 100.92 181.912 100.661 182.232 100.661H225.042C225.361 100.661 225.62 100.92 225.62 101.24V102.397C225.62 102.716 225.361 102.975 225.042 102.975H182.232C181.912 102.975 181.653 102.716 181.653 102.397V101.24Z"
                    fill="url(#paint6_linear_2181_104267)"
                    fillOpacity="0.1"
                  ></path>
                  <path
                    d="M52.0664 160.248C52.0664 159.928 52.3254 159.669 52.6449 159.669H119.752C120.072 159.669 120.331 159.928 120.331 160.248V161.405C120.331 161.724 120.072 161.983 119.752 161.983H52.6449C52.3254 161.983 52.0664 161.724 52.0664 161.405V160.248Z"
                    fill="url(#paint7_linear_2181_104267)"
                    fillOpacity="0.1"
                  ></path>
                  <path
                    d="M52.0664 171.818C52.0664 171.499 52.3254 171.24 52.6449 171.24H110.496C110.816 171.24 111.075 171.499 111.075 171.818V172.975C111.075 173.295 110.816 173.554 110.496 173.554H52.6449C52.3254 173.554 52.0664 173.295 52.0664 172.975V171.818Z"
                    fill="url(#paint8_linear_2181_104267)"
                    fillOpacity="0.1"
                  ></path>
                  <path
                    d="M52.0664 99.5041C52.0664 96.948 54.1385 94.876 56.6945 94.876H105.29C107.846 94.876 109.918 96.948 109.918 99.5041V104.132C109.918 106.688 107.846 108.76 105.29 108.76H56.6945C54.1385 108.76 52.0664 106.688 52.0664 104.132V99.5041Z"
                    fill="url(#paint9_linear_2181_104267)"
                    fillOpacity="0.1"
                  ></path>
                  <path
                    d="M123.802 101.24C123.802 100.92 124.061 100.661 124.38 100.661H167.19C167.51 100.661 167.769 100.92 167.769 101.24V102.397C167.769 102.716 167.51 102.975 167.19 102.975H124.38C124.061 102.975 123.802 102.716 123.802 102.397V101.24Z"
                    fill="url(#paint10_linear_2181_104267)"
                    fillOpacity="0.1"
                  ></path>
                  <path
                    d="M181.653 101.24C181.653 100.92 181.912 100.661 182.232 100.661H225.042C225.361 100.661 225.62 100.92 225.62 101.24V102.397C225.62 102.716 225.361 102.975 225.042 102.975H182.232C181.912 102.975 181.653 102.716 181.653 102.397V101.24Z"
                    fill="url(#paint11_linear_2181_104267)"
                    fillOpacity="0.1"
                  ></path>
                  <g opacity="0.5">
                    <rect
                      height="260.331"
                      rx="16.0826"
                      stroke="#404040"
                      strokeWidth="1.15702"
                      width="260.331"
                      x="9.83437"
                      y="9.83462"
                    ></rect>
                    <rect
                      fill="#404040"
                      height="6.94215"
                      rx="3.47107"
                      width="6.94215"
                      x="23.1406"
                      y="23.1404"
                    ></rect>
                    <rect
                      fill="#404040"
                      height="6.94215"
                      rx="3.47107"
                      width="6.94215"
                      x="34.7109"
                      y="23.1404"
                    ></rect>
                    <rect
                      fill="#404040"
                      height="6.94215"
                      rx="3.47107"
                      width="6.94215"
                      x="46.2812"
                      y="23.1404"
                    ></rect>
                  </g>
                  <path
                    className="transition-[stroke-dashoffset] [transition-duration:400ms] group-hover:[transition-delay:calc(200ms)] group-hover:[stroke-dashoffset:0]"
                    d="M58 101.856L104 101.856"
                    stroke="white"
                    strokeDasharray="54"
                    strokeDashoffset="54"
                    strokeOpacity="0.2"
                    strokeWidth="2"
                    style={
                      {
                        transitionTimingFunction: "ease-in-out",
                      } as React.CSSProperties
                    }
                  ></path>
                  <path
                    className="transition-[stroke-dashoffset] [transition-duration:400ms] group-hover:[transition-delay:calc(200ms+200ms)] group-hover:[stroke-dashoffset:0]"
                    d="M52 149.256H98"
                    stroke="white"
                    strokeDasharray="54"
                    strokeDashoffset="54"
                    strokeOpacity="0.2"
                    strokeWidth="2"
                    style={
                      {
                        transitionTimingFunction: "ease-in-out",
                      } as React.CSSProperties
                    }
                  ></path>
                </g>
                <defs>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(35.8682 77.5208) rotate(40.2099) scale(293.921 564.171)"
                    gradientUnits="userSpaceOnUse"
                    id="paint0_diamond_2181_104267"
                    r="1"
                  >
                    <stop
                      offset="0.0123298"
                      stopColor="white"
                      stopOpacity="0"
                    ></stop>
                    <stop
                      offset="0.427385"
                      stopColor="white"
                      stopOpacity="0.5"
                    ></stop>
                    <stop offset="0.512093" stopColor="white"></stop>
                    <stop
                      offset="0.584904"
                      stopColor="white"
                      stopOpacity="0.5"
                    ></stop>
                    <stop offset="1" stopColor="white" stopOpacity="0"></stop>
                  </radialGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint1_linear_2181_104267"
                    x1="137.686"
                    x2="137.686"
                    y1="181.074"
                    y2="275.95"
                  >
                    <stop stopColor="#0A0A0A" stopOpacity="0"></stop>
                    <stop offset="1" stopColor="#0A0A0A"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint2_linear_2181_104267"
                    x1="52.0664"
                    x2="225.62"
                    y1="135.25"
                    y2="134.215"
                  >
                    <stop stopColor="#525252"></stop>
                    <stop offset="1" stopColor="#0A0A0A"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint3_linear_2181_104267"
                    x1="52.0664"
                    x2="225.62"
                    y1="135.25"
                    y2="134.215"
                  >
                    <stop stopColor="#525252"></stop>
                    <stop offset="1" stopColor="#0A0A0A"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint4_linear_2181_104267"
                    x1="52.0664"
                    x2="225.62"
                    y1="135.25"
                    y2="134.215"
                  >
                    <stop stopColor="#525252"></stop>
                    <stop offset="1" stopColor="#0A0A0A"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint5_linear_2181_104267"
                    x1="52.0664"
                    x2="225.62"
                    y1="135.25"
                    y2="134.215"
                  >
                    <stop stopColor="#525252"></stop>
                    <stop offset="1" stopColor="#0A0A0A"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint6_linear_2181_104267"
                    x1="52.0664"
                    x2="225.62"
                    y1="135.25"
                    y2="134.215"
                  >
                    <stop stopColor="#525252"></stop>
                    <stop offset="1" stopColor="#0A0A0A"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint7_linear_2181_104267"
                    x1="52.0664"
                    x2="225.62"
                    y1="135.25"
                    y2="134.215"
                  >
                    <stop stopColor="#525252"></stop>
                    <stop offset="1" stopColor="#0A0A0A"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint8_linear_2181_104267"
                    x1="52.0664"
                    x2="225.62"
                    y1="135.25"
                    y2="134.215"
                  >
                    <stop stopColor="#525252"></stop>
                    <stop offset="1" stopColor="#0A0A0A"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint9_linear_2181_104267"
                    x1="52.0664"
                    x2="225.62"
                    y1="135.25"
                    y2="134.215"
                  >
                    <stop stopColor="#525252"></stop>
                    <stop offset="1" stopColor="#0A0A0A"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint10_linear_2181_104267"
                    x1="52.0664"
                    x2="225.62"
                    y1="135.25"
                    y2="134.215"
                  >
                    <stop stopColor="#525252"></stop>
                    <stop offset="1" stopColor="#0A0A0A"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint11_linear_2181_104267"
                    x1="52.0664"
                    x2="225.62"
                    y1="135.25"
                    y2="134.215"
                  >
                    <stop stopColor="#525252"></stop>
                    <stop offset="1" stopColor="#0A0A0A"></stop>
                  </linearGradient>
                  <clipPath id="clip0_2181_104267">
                    <rect fill="white" height="280" width="280"></rect>
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
