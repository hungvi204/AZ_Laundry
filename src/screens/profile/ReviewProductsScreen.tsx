import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSelector } from 'react-redux';
import { FONTFAMILY } from '../../../assets/fonts';
import COLORS from '../../assets/colors/Colors';
import IMAGES from '../../assets/images/Images';
import { ButtonComponent, CardOrderDetailComponent, HeaderComponent, KeyboardAvoidingViewWrapper, RowComponent, SectionComponent, TextComponent } from '../../components';
import { authSelector } from '../../redux/reducers/authReducer';
import reviewAPI from '../../apis/reviewAPI';
import { UserModel } from '../../model/user_model';
import authenticationAPI from '../../apis/authAPI';

const ReviewProductsScreen = ({ navigation, route }: any) => {
    const user = useSelector(authSelector);
    const { productData } = route.params;
    const [details, setDetailShop] = useState<UserModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [rating, setRating] = useState(1);
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState<{ uri: string | undefined; type: string | undefined; name: string | undefined; }[]>([]);

    const totalProducts = Array.isArray(productData.products)
        ? productData.products.length
        : 0;

        const getDataDetailShop = async () => {
            try {
                const res: any = await authenticationAPI.HandleAuthentication(`/get-user-by-id?id_user=${productData.shopDetail.id_shop}`);
                if (Array.isArray(res)) {
                    setDetailShop(res);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching shop: ', error);
                setLoading(false);
            }
        };        

    const handleAddFile = async (type: string) => {
        try {
            const options = {
                mediaType: type as 'photo' | 'video', 
                selectionLimit: 1,
            };

            const result = await launchImageLibrary(options);

            if (result.assets && result.assets.length > 0) {
                let newFile = {
                    uri: result.assets[0].uri,
                    type: result.assets[0].type,
                    name: result.assets[0].fileName,
                };
                setFiles((prevFiles) => [...prevFiles, newFile]);
            }
        } catch (error) {
            console.log('Error adding file:', error);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const addReview = async () => {
        try {
            const formData = new FormData();
            formData.append('id_user', user?.id);
            formData.append('id_shop', productData.shopDetail.id_shop);
            formData.append('orderId', productData.products[0]._id);
            formData.append('rating', rating.toString()); // Chuyển số thành chuỗi
            formData.append('comment', comment);
    
            // Thêm các tệp tin (images/videos) vào FormData
            files.forEach((file, index) => {
                formData.append('files', {
                    uri: file.uri,
                    type: file.type,
                    name: file.name || `file_${index}`,
                });
            });
    
            // Gọi API với dữ liệu dạng FormData
            const res = await reviewAPI.HandleReview('/add-review', formData, 'post');
            
    
            // Hiển thị thông báo thành công
            Alert.alert('Thành công', 'Đánh giá đã được thêm.', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            console.error('Error adding review:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi thêm đánh giá.');
        }
    };

    useEffect(() => {
        getDataDetailShop();
    }, []);    

    return (
        <>
            <HeaderComponent title="Đánh giá đơn hàng" isBack onBack={() => navigation.goBack()} />

           <KeyboardAvoidingViewWrapper >
            <SectionComponent>
                    <RowComponent justify='center' styles={{ marginTop: 30 }}>
                        <TextComponent text={'Thêm đánh giá sản phẩm mua hàng từ shop.'} color={COLORS.ORANGE} size={13} font='Nunito' styles={{ fontStyle: 'italic' }} />
                    </RowComponent>
                    <RowComponent justify='center' styles={{ marginTop: 5 }}>
                        <TextComponent text={'Để shop hoàn thiện hơn mỗi ngày. Cảm ơn bạn đã đồng hành cùng shop!'} color={COLORS.ORANGE} size={13} font='Nunito' styles={{ fontStyle: 'italic' }} />
                    </RowComponent>
                </SectionComponent>

                <SectionComponent>
                    <RowComponent styles={{ marginBottom: 15 }}>
                        <TextComponent text={`Sản phẩm(${totalProducts})`} size={16} color={COLORS.HEX_BLACK} font={FONTFAMILY.montserrat_bold} />
                    </RowComponent>
                    <RowComponent styles={{ marginBottom: 15 }}>
                        <Image source={IMAGES.iconshop} style={{ width: 20, height: 20, marginTop: 5, marginRight: 10 }} />
                        <TextComponent text={`${details[0]?.data_user?.shop_name}`} size={16} color={COLORS.HEX_BLACK} font={FONTFAMILY.montserrat_bold} />
                    </RowComponent>
                    {productData.products.map((cartItem: any) => (
                        <View key={cartItem._id.toString()}
                            style={{
                                backgroundColor: COLORS.WHITE,
                                borderRadius: 8,
                                paddingTop: 15,
                                marginBottom: 8,
                            }}>
                            <CardOrderDetailComponent
                                imageUrl={cartItem.id_product.product_photo[0]}
                                productName={cartItem.id_product.product_name}
                                short_description={cartItem.id_product.short_description}
                                price={cartItem.cart_subtotal} />
                        </View>
                    ))}
                </SectionComponent>

                <SectionComponent>
                    <RowComponent>
                        <ButtonComponent
                            text="Thêm hình ảnh"
                            icon={<Image source={IMAGES.camera_alt} style={{ width: 20, height: 20 }} />}
                            iconFlex="left"
                            type="#00ADEF"
                            textColor={COLORS.AZURE_BLUE}
                            textStyles={{ fontFamily: FONTFAMILY.montserrat_medium }}
                            styles={{
                                width: "49%",
                                marginRight: 10,
                                backgroundColor: COLORS.HEX_GRAY,
                                borderColor: COLORS.AZURE_BLUE,
                                borderWidth: 1,
                                borderRadius: 1,
                            }}
                            onPress={() => handleAddFile('photo')}
                        />
                        <ButtonComponent
                            text="Thêm video"
                            icon={<Image source={IMAGES.photo_camera} style={{ width: 20, height: 20 }} />}
                            iconFlex="left"
                            type="#00ADEF"
                            textColor={COLORS.AZURE_BLUE}
                            textStyles={{ fontFamily: FONTFAMILY.montserrat_medium }}
                            styles={{
                                width: "49%",
                                marginRight: 10,
                                backgroundColor: COLORS.HEX_GRAY,
                                borderColor: COLORS.AZURE_BLUE,
                                borderWidth: 1,
                                borderRadius: 1
                            }}
                            onPress={() => handleAddFile('video')}
                        />
                    </RowComponent>

                    <RowComponent styles={{ marginTop: 10, flexWrap: 'wrap' }}>
                        {files.map((file, index) => (
                            <View key={index} style={{ margin: 5 }}>
                                <TouchableOpacity onPress={() => handleRemoveFile(index)} style={{ position: 'relative' }}>
                                    <Image
                                        source={{ uri: file.uri }}
                                        style={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: 5,
                                            borderWidth: 1,
                                            borderColor: COLORS.GRAY,
                                        }}
                                    />
                                    <View style={{
                                        position: 'absolute',
                                        top: -5,
                                        right: -5,
                                        backgroundColor: COLORS.RED,
                                        borderRadius: 15,
                                        width: 20,
                                        height: 20,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <TextComponent
                                            text="X"
                                            color={COLORS.WHITE}
                                            size={12}
                                            font={FONTFAMILY.montserrat_bold}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </RowComponent>

                </SectionComponent>

                <RowComponent justify="center" styles={{ marginVertical: 20 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Image
                                source={star <= rating ? IMAGES.star1 : IMAGES.star2}
                                style={{ marginHorizontal: 5 }}
                            />
                        </TouchableOpacity>
                    ))}
                </RowComponent>


                <SectionComponent>
                    <TextInput
                        placeholder='Hãy chia sẻ những điều bạn thích ở sản phẩm này nhé'
                        placeholderTextColor={COLORS.HEX_LIGHT_GREY}
                        value={comment}
                        onChangeText={(val) => setComment(val)}
                        multiline={true}
                        numberOfLines={6}
                        style={{
                            backgroundColor: COLORS.WHITE,
                            textAlignVertical: 'top',
                            paddingHorizontal: 20,
                            paddingTop: 10,
                            paddingBottom: 0,
                            borderRadius: 16,
                            color: COLORS.HEX_BLACK,
                        }} />
                </SectionComponent>


                <SectionComponent>
                    <RowComponent>
                        <ButtonComponent
                            text="Đánh giá"
                            type="#00ADEF"
                            styles={{ width: "100%" }}
                            textStyles={{ fontFamily: FONTFAMILY.montserrat_medium }}
                            onPress={addReview}
                        />
                    </RowComponent>
                </SectionComponent>
           </KeyboardAvoidingViewWrapper>

        </>
    );
};

export default ReviewProductsScreen;