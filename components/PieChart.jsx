import { Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { getColors } from '../constants/colors';

const PieChart = ({ data, size = 200 }) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2;
  const strokeWidth = 40;
  const innerRadius = radius - strokeWidth;
  const circumference = 2 * Math.PI * innerRadius;

  let currentAngle = -90; // Start from top

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation={0} origin={`${radius}, ${radius}`}>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDashoffset = circumference - (circumference * percentage) / 100;
            const rotation = currentAngle;
            currentAngle += (360 * percentage) / 100;

            return (
              <Circle
                key={index}
                cx={radius}
                cy={radius}
                r={innerRadius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                rotation={rotation}
                origin={`${radius}, ${radius}`}
                strokeLinecap="round"
              />
            );
          })}
        </G>
      </Svg>

      {/* Legend */}
      <View style={{ marginTop: 20, width: '100%' }}>
        {data.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: item.color,
                marginRight: 8,
              }}
            />
            <Text style={{ flex: 1, color: colors.text, fontSize: 14 }}>
              {item.label}
            </Text>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>
              ₹{item.value.toFixed(0)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>
              ({item.percentage.toFixed(1)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default PieChart;
